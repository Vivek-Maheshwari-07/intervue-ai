"""
Interview Service — core business logic orchestrator.

Responsibilities:
 1. Load or create session from SQLite
 2. Route to agent adapter for question generation / answer evaluation
 3. Enforce completion rules (>= 8 questions AND >= 4 topics)
 4. Return clean API response shapes
"""

from __future__ import annotations

import json
import uuid
import logging

from database import session_manager as sm
from services import agent_adapter as agent
from models.schemas import (
    InterviewOngoingResponse,
    InterviewCompletedResponse,
    FeedbackPayload,
)

logger = logging.getLogger(__name__)

MIN_QUESTIONS = 8
MIN_TOPICS = 4


def is_interview_complete(session: dict) -> bool:
    """Completion rule enforced by application code, NOT by the LLM."""
    return (
        session.get("question_count", 0) >= MIN_QUESTIONS
        and len(session.get("covered_topics", [])) >= MIN_TOPICS
    )


async def process_interview_turn(
    session_id: str,
    candidate_id: str,
    answer: str,
) -> InterviewOngoingResponse | InterviewCompletedResponse:
    """
    Main entry point called by the API endpoint.

    Flow:
      - empty answer  → start / continue: generate first question
      - non-empty answer → evaluate → check completion → next question or feedback
    """

    # 1. Load or create session
    session = await sm.get_session(session_id)
    is_new = session is None

    if is_new:
        session = await sm.create_session(session_id, candidate_id)

    # Guard: candidateId must match
    if session["candidate_id"] != candidate_id:
        raise ValueError(
            f"Session '{session_id}' belongs to candidate '{session['candidate_id']}', "
            f"not '{candidate_id}'."
        )

    # If the session is already completed, return feedback
    if session["status"] == "completed":
        feedback_data = session.get("feedback", {})
        if isinstance(feedback_data, str):
            try:
                feedback_data = json.loads(feedback_data)
            except (json.JSONDecodeError, TypeError):
                feedback_data = {}
        return InterviewCompletedResponse(
            sessionId=session_id,
            feedback=FeedbackPayload(**feedback_data) if feedback_data else FeedbackPayload(),
            questionNumber=session["question_count"],
            topicsCovered=len(session.get("covered_topics", [])),
            coveredTopics=session.get("covered_topics", []),
            conversationHistory=session.get("conversation_history", []),
        )

    # 2. First turn (empty answer) — generate opening question
    answer_stripped = answer.strip()

    if not answer_stripped and (is_new or not session.get("current_question")):
        result = await agent.generate_question(candidate_id, session)
        question = result["question"]
        topic = result["topic"]

        # Store the current question in session (not yet counted as "asked")
        await sm.update_session(
            session_id,
            current_question=question,
            current_topic=topic,
        )

        # Add interviewer question to conversation history
        history = session.get("conversation_history", [])
        history.append({"role": "interviewer", "content": question, "topic": topic})
        await sm.update_session(
            session_id,
            conversation_history=json.dumps(history),
        )

        session = await sm.get_session(session_id)

        return InterviewOngoingResponse(
            sessionId=session_id,
            question=question,
            questionNumber=session["question_count"] + 1,
            topicsCovered=len(session.get("covered_topics", [])),
            coveredTopics=session.get("covered_topics", []),
            conversationHistory=session.get("conversation_history", []),
        )

    # 3. Subsequent turn — answer was provided
    current_question = session.get("current_question", "")
    current_topic = session.get("current_topic", "")

    if not current_question:
        # Edge case: answer provided but no question on record — generate one first
        result = await agent.generate_question(candidate_id, session)
        current_question = result["question"]
        current_topic = result["topic"]

    # 3a. Evaluate the answer
    eval_result = await agent.evaluate_answer(current_question, answer_stripped, session)
    score = eval_result["score"]

    # 3b. Save to session
    await sm.save_answer(session_id, current_question, answer_stripped, score, current_topic)
    await sm.increment_question_count(session_id)

    # Reload session after updates
    session = await sm.get_session(session_id)

    # 3c. Check completion
    if is_interview_complete(session):
        feedback = await agent.generate_feedback(session)
        await sm.complete_session(session_id, feedback)
        session = await sm.get_session(session_id)

        return InterviewCompletedResponse(
            sessionId=session_id,
            feedback=FeedbackPayload(**feedback),
            questionNumber=session["question_count"],
            topicsCovered=len(session.get("covered_topics", [])),
            coveredTopics=session.get("covered_topics", []),
            conversationHistory=session.get("conversation_history", []),
        )

    # 3d. Generate next question
    next_result = await agent.generate_question(candidate_id, session)
    next_question = next_result["question"]
    next_topic = next_result["topic"]

    # Store next question and append to history
    history = session.get("conversation_history", [])
    history.append({"role": "interviewer", "content": next_question, "topic": next_topic})

    await sm.update_session(
        session_id,
        current_question=next_question,
        current_topic=next_topic,
        conversation_history=json.dumps(history),
    )

    session = await sm.get_session(session_id)

    return InterviewOngoingResponse(
        sessionId=session_id,
        question=next_question,
        questionNumber=session["question_count"] + 1,
        topicsCovered=len(session.get("covered_topics", [])),
        coveredTopics=session.get("covered_topics", []),
        conversationHistory=session.get("conversation_history", []),
        adaptiveSignal=eval_result.get("adaptive_signal"),
    )
