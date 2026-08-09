"""
Interview Service — core HTTP and session integration layer.

# InterviewAgent is the authoritative interview orchestration layer.
# This service handles HTTP/session integration only.

Responsibilities:
 1. Load or create session from SQLite
 2. Delegate turn processing and state transitions to InterviewAgent
 3. Persist updated InterviewAgent state to SQLite
 4. Return clean API response shapes satisfying Technical Specification
"""

from __future__ import annotations

import json
import logging

from database import session_manager as sm
from services import agent_adapter
from models.schemas import (
    InterviewOngoingResponse,
    InterviewCompletedResponse,
    FeedbackPayload,
)

logger = logging.getLogger(__name__)


async def process_interview_turn(
    session_id: str,
    candidate_id: str,
    answer: str = "",
    candidate_info: dict | str | None = None,
) -> InterviewOngoingResponse | InterviewCompletedResponse:
    """
    Main entry point called by the API endpoint.

    InterviewAgent is the SINGLE SOURCE OF TRUTH for workflow, evaluation, planning, and completion.
    This service handles SQLite persistence and API contract conversion.
    """

    # 1. Load or create session from SQLite
    session = await sm.get_session(session_id)
    is_new = session is None

    if is_new:
        session = await sm.create_session(session_id, candidate_id)

    # Validate candidateId matching if existing session
    if session.get("candidate_id") and session["candidate_id"] != candidate_id:
        raise ValueError(
            f"Session '{session_id}' belongs to candidate '{session['candidate_id']}', "
            f"not '{candidate_id}'."
        )

    # 2. Check if session is already completed
    if session.get("status") == "completed":
        feedback_data = session.get("feedback", {})
        if isinstance(feedback_data, str):
            try:
                feedback_data = json.loads(feedback_data)
            except (json.JSONDecodeError, TypeError):
                feedback_data = {}

        return InterviewCompletedResponse(
            sessionId=session_id,
            reply="Interview completed.",
            done=True,
            status="completed",
            feedback=FeedbackPayload(**feedback_data) if isinstance(feedback_data, dict) and feedback_data else FeedbackPayload(),
            questionNumber=session.get("question_count", 0),
            topicsCovered=len(session.get("covered_topics", [])),
            coveredTopics=session.get("covered_topics", []),
            conversationHistory=session.get("conversation_history", []),
        )

    # 3. Construct authoritative InterviewAgent bound to session state
    agent = agent_adapter.build_agent(session)
    cand_profile = agent_adapter.get_candidate_profile(candidate_info or candidate_id)

    answer_stripped = answer.strip()

    # 4. START Turn — empty answer on new session or unstarted session
    if not answer_stripped and (is_new or not session.get("current_question")):
        start_res = agent.start_interview(candidate_info=cand_profile)
        question = start_res["question"]
        topic = start_res["topic"]

        # Sync state to SQLite
        history = agent.state.conversation_history
        await sm.update_session(
            session_id,
            current_question=question,
            current_topic=topic,
            covered_days=json.dumps(agent.state.covered_days),
            covered_topics=json.dumps(agent.state.covered_topics),
            conversation_history=json.dumps(history),
            status=agent.state.status,
        )

        session = await sm.get_session(session_id)

        return InterviewOngoingResponse(
            sessionId=session_id,
            reply=question,
            done=False,
            status="ongoing",
            question=question,
            questionNumber=1,
            topicsCovered=len(session.get("covered_topics", [])),
            coveredTopics=session.get("covered_topics", []),
            conversationHistory=session.get("conversation_history", []),
        )

    # 5. SUBSEQUENT Turn — candidate provided an answer
    # Delegate turn orchestration strictly to InterviewAgent.process_answer()
    turn_res = agent.process_answer(answer_stripped)

    # Sync updated InterviewAgent state to SQLite
    history_json = json.dumps(agent.state.conversation_history)
    topics_json = json.dumps(agent.state.covered_topics)
    days_json = json.dumps(agent.state.covered_days)
    scores_json = json.dumps(agent.state.scores)

    current_q = agent.last_asked_question or turn_res.get("next_question", "")
    current_t = agent.state.current_topic or ""

    await sm.update_session(
        session_id,
        question_count=agent.state.question_count,
        current_question=current_q,
        current_topic=current_t,
        covered_days=days_json,
        covered_topics=topics_json,
        conversation_history=history_json,
        scores=scores_json,
        status=agent.state.status,
    )

    # Check if InterviewAgent marked the session as completed
    if agent.should_end() or turn_res.get("is_complete") or agent.state.is_completed():
        feedback_data = turn_res.get("feedback") or agent.generate_feedback()
        await sm.complete_session(session_id, feedback_data)
        session = await sm.get_session(session_id)

        return InterviewCompletedResponse(
            sessionId=session_id,
            reply="Interview completed.",
            done=True,
            status="completed",
            feedback=FeedbackPayload(**feedback_data) if isinstance(feedback_data, dict) else FeedbackPayload(),
            questionNumber=agent.state.question_count,
            topicsCovered=len(agent.state.covered_topics),
            coveredTopics=agent.state.covered_topics,
            conversationHistory=agent.state.conversation_history,
        )

    # Otherwise return ongoing response with next question
    session = await sm.get_session(session_id)
    next_q = turn_res.get("next_question", current_q)

    return InterviewOngoingResponse(
        sessionId=session_id,
        reply=next_q,
        done=False,
        status="ongoing",
        question=next_q,
        questionNumber=agent.state.question_count + 1,
        topicsCovered=len(agent.state.covered_topics),
        coveredTopics=agent.state.covered_topics,
        conversationHistory=agent.state.conversation_history,
        adaptiveSignal=agent_adapter.extract_adaptive_signal(agent),
    )
