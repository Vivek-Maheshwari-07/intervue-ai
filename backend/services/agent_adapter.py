"""
Agent Adapter — integration layer for the InterviewAgent.

Connects:
- InterviewAgent (backend/agent/interview_agent.py)
- CurriculumRetriever (src/retriever.py)
- FastAPI interview service (backend/services/interview_service.py)
- SQLite session management (backend/database/session_manager.py)
"""

from __future__ import annotations

import logging
import os
import sys
from typing import Dict, Any, Optional

# Ensure project root is in sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from agent.interview_agent import InterviewAgent
from agent.state import InterviewState, STATUS_IN_PROGRESS, STATUS_COMPLETED
from agent.llm_client import OllamaLLMClient, MockLLMClient, OllamaConnectionError
from agent.evaluator import evaluate_answer as agent_evaluate_answer, map_score_to_quality, AnswerEvaluation
from agent.question_planner import PlannerAction, ACTION_NEW_TOPIC, ACTION_HARDER, ACTION_CLARIFY, ACTION_MODERATE

logger = logging.getLogger(__name__)

# Single shared LLM client instance
_llm_client_instance: Optional[Any] = None


def get_llm_client():
    """Retrieve or create the LLM client instance (OllamaLLMClient with fallback capability)."""
    global _llm_client_instance
    if _llm_client_instance is None:
        timeout = int(os.environ.get("OLLAMA_TIMEOUT", "3"))
        _llm_client_instance = OllamaLLMClient(timeout=timeout)
    return _llm_client_instance


# ── RAG Retriever helper ──────────────────────────────────────────────────────

_retriever_instance = None
_retriever_initialized = False


def _get_retriever():
    """Lazy initialize CurriculumRetriever."""
    global _retriever_instance, _retriever_initialized
    if not _retriever_initialized:
        _retriever_initialized = True
        try:
            from src.retriever import CurriculumRetriever
            _retriever_instance = CurriculumRetriever()
        except Exception as exc:
            logger.warning("Could not initialize CurriculumRetriever: %s", exc)
            _retriever_instance = None
    return _retriever_instance


def retrieve_curriculum_text(query: str) -> str:
    """
    Search ChromaDB vector store using CurriculumRetriever and return formatted text.
    Handles RAG failures gracefully.
    """
    retriever = _get_retriever()
    if not retriever:
        return f"Standard curriculum context reference for: {query}"
    try:
        results = retriever.search_curriculum(query, top_k=3)
        if not results:
            return f"Standard curriculum context reference for: {query}"
        docs = [r.get("document", "") for r in results if isinstance(r, dict) and r.get("document")]
        if docs:
            return "\n\n".join(docs)
        return f"Standard curriculum context reference for: {query}"
    except Exception as exc:
        logger.warning("RAG retrieval error for query '%s': %s", query, exc)
        return f"Standard curriculum context reference for: {query}"


# ── Candidate Loader helper ──────────────────────────────────────────────────

_candidate_loader_instance = None
_candidate_loader_initialized = False


def _get_candidate_loader():
    """Lazy initialize CandidateLoader from data/candidates.json."""
    global _candidate_loader_instance, _candidate_loader_initialized
    if not _candidate_loader_initialized:
        _candidate_loader_initialized = True
        try:
            from src.candidate_loader import CandidateLoader
            json_path = os.path.join(ROOT_DIR, "data", "candidates.json")
            if os.path.exists(json_path):
                _candidate_loader_instance = CandidateLoader(json_path)
        except Exception as exc:
            logger.warning("Could not initialize CandidateLoader: %s", exc)
            _candidate_loader_instance = None
    return _candidate_loader_instance


def get_candidate_profile(candidate_id: str) -> dict:
    """Retrieve structured candidate profile or return basic fallback dict."""
    loader = _get_candidate_loader()
    if loader:
        cand_record = loader.get_candidate(candidate_id)
        if cand_record and isinstance(cand_record, dict):
            member = cand_record.get("member", {})
            return {
                "candidate_id": candidate_id,
                "name": member.get("name", candidate_id),
                "jobRole": member.get("jobRole", "AI Engineering Specialist"),
                "yearsExperience": member.get("yearsExperience", 5),
                "missions": cand_record.get("missions", []),
                "signals": cand_record.get("signals", {}),
            }
    return {"candidate_id": candidate_id, "jobRole": "Software Engineer"}


# ── Session State <-> InterviewAgent Bridge ──────────────────────────────────

def _build_agent(session_state: dict) -> InterviewAgent:
    """
    Reconstruct an InterviewAgent from an existing SQLite session dict.
    """
    candidate_id = session_state.get("candidate_id", "")
    candidate_info = get_candidate_profile(candidate_id) if candidate_id else session_state.get("candidate_info", {})

    state = InterviewState(
        session_id=session_state.get("session_id", "default_session"),
        candidate_info=candidate_info,
        question_count=session_state.get("question_count", 0),
        covered_days=session_state.get("covered_days", []),
        covered_topics=session_state.get("covered_topics", []),
        conversation_history=session_state.get("conversation_history", []),
        scores=session_state.get("scores", []),
        evaluations=session_state.get("evaluations", []),
        current_topic=session_state.get("current_topic"),
        current_day=session_state.get("current_day"),
        status=session_state.get("status", STATUS_IN_PROGRESS),
    )

    llm = get_llm_client()
    agent = InterviewAgent(
        state=state,
        curriculum_retriever=retrieve_curriculum_text,
        llm_client=llm,
    )

    if session_state.get("current_question"):
        agent.last_asked_question = session_state["current_question"]

    return agent


# ── Public Adapter Methods (Called by InterviewService) ──────────────────────

async def generate_question(
    candidate_id: str,
    session_state: dict,
) -> dict:
    """
    Generate the next interview question using InterviewAgent and CurriculumRetriever.

    Returns: {"question": str, "topic": str}
    """
    cand_profile = get_candidate_profile(candidate_id)
    agent = _build_agent(session_state)
    q_count = session_state.get("question_count", 0)
    covered = session_state.get("covered_topics", [])

    # If new session (question_count == 0 and empty covered_topics), start interview
    if q_count == 0 and not covered:
        result = agent.start_interview(candidate_info=cand_profile)
        return {
            "question": result["question"],
            "topic": result["topic"],
        }

    # Otherwise plan next question based on current state & scores
    current_topic = session_state.get("current_topic") or (covered[-1] if covered else "Data Structures & Algorithmic Efficiency")
    current_day = session_state.get("current_day") or "Day 1: Fundamentals & Code Quality"
    scores = session_state.get("scores", [])

    if scores:
        last_score = scores[-1]
        last_eval = AnswerEvaluation(score=last_score, quality=map_score_to_quality(last_score))
    else:
        last_eval = AnswerEvaluation(score=5.0, quality="moderate")

    # Count questions on current topic
    history = session_state.get("conversation_history", [])
    questions_on_topic = sum(1 for h in history if h.get("topic") == current_topic) or 1

    action = agent.planner.plan_next_action(
        evaluation=last_eval,
        current_topic=current_topic,
        current_day=current_day,
        covered_topics=covered,
        covered_days=session_state.get("covered_days", []),
        questions_on_current_topic=questions_on_topic,
        total_questions=q_count,
        required_unique_units=4,
    )

    target_topic = action.target_topic or current_topic
    curriculum_context = retrieve_curriculum_text(target_topic)

    question = agent.generate_question(action, curriculum_context)

    return {
        "question": question,
        "topic": target_topic,
    }


async def evaluate_answer(
    question: str,
    answer: str,
    session_state: dict,
) -> dict:
    """
    Evaluate the candidate's answer using InterviewAgent and evaluator logic.

    Returns: {"score": float, "evaluation": str, "adaptive_signal": dict}
    """
    agent = _build_agent(session_state)
    topic = session_state.get("current_topic") or "General Technical"
    curriculum_context = retrieve_curriculum_text(topic)

    evaluation = agent_evaluate_answer(
        question=question,
        answer=answer,
        curriculum_context=curriculum_context,
        llm_client=agent.llm_client,
    )

    eval_text = evaluation.reasoning or f"Quality: {evaluation.quality}. {', '.join(evaluation.strengths)}"
    if not eval_text:
        eval_text = "Answer evaluated."

    # Compute planner action to build adaptive signal metadata
    covered = session_state.get("covered_topics", [])
    history = session_state.get("conversation_history", [])
    questions_on_topic = sum(1 for h in history if h.get("topic") == topic) or 1

    action = agent.planner.plan_next_action(
        evaluation=evaluation,
        current_topic=topic,
        current_day=session_state.get("current_day") or "Day 1",
        covered_topics=covered,
        covered_days=session_state.get("covered_days", []),
        questions_on_current_topic=questions_on_topic,
        total_questions=session_state.get("question_count", 0),
        required_unique_units=4,
    )

    # Safe user-facing reason (NEVER expose internal chain of thought)
    reason_map = {
        ACTION_HARDER: "Strong technical answer demonstrated — increasing difficulty depth.",
        ACTION_CLARIFY: "Knowledge gap detected — tailoring clarification question.",
        ACTION_MODERATE: "Solid core explanation — maintaining current difficulty level.",
        ACTION_NEW_TOPIC: f"Topic depth satisfied — transitioning to {action.target_topic or 'next curriculum topic'}.",
    }
    safe_reason = reason_map.get(action.action_type, "Answer evaluated and adaptive path updated.")

    adaptive_signal = {
        "action": action.action_type,
        "quality": evaluation.quality,
        "score": evaluation.score,
        "topic": topic,
        "difficultyDelta": action.difficulty_delta,
        "reason": safe_reason,
    }

    return {
        "score": evaluation.score,
        "evaluation": eval_text,
        "adaptive_signal": adaptive_signal,
    }


async def generate_feedback(session_state: dict) -> dict:
    """
    Generate final interview feedback using InterviewAgent and feedback synthesis.

    Returns: {"summary": str, "strengths": list[str], "gaps": list[str], "next": list[str]}
    """
    agent = _build_agent(session_state)
    return agent.generate_feedback()

