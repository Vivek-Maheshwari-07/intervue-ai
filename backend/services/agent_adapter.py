"""
Agent Adapter — integration layer for the InterviewAgent.

Connects:
- InterviewAgent (backend/agent/interview_agent.py)
- CurriculumRetriever (src/retriever.py)
- FastAPI interview service (backend/services/interview_service.py)
- SQLite session management (backend/database/session_manager.py)
"""

from __future__ import annotations

import json
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
from agent.llm_client import OllamaLLMClient, MockLLMClient
from agent.evaluator import evaluate_answer as agent_evaluate_answer, AnswerEvaluation, map_score_to_quality
from agent.question_planner import ACTION_NEW_TOPIC, ACTION_HARDER, ACTION_CLARIFY, ACTION_MODERATE

logger = logging.getLogger(__name__)

# Single shared LLM client instance
_llm_client_instance: Optional[Any] = None


def get_llm_client():
    """Retrieve or create the LLM client instance."""
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


def retrieve_curriculum_details(query: str) -> dict:
    """
    Search ChromaDB vector store using CurriculumRetriever and return text + day metadata.
    """
    retriever = _get_retriever()
    if not retriever:
        return {"text": f"Standard curriculum context reference for: {query}", "day": None, "title": None}
    try:
        results = retriever.search_curriculum(query, top_k=3)
        if not results:
            return {"text": f"Standard curriculum context reference for: {query}", "day": None, "title": None}
        docs = [r.get("document", "") for r in results if isinstance(r, dict) and r.get("document")]
        top_day = None
        top_title = None
        for r in results:
            if isinstance(r, dict):
                meta = r.get("metadata", {})
                if top_day is None and meta.get("day") is not None:
                    top_day = f"Day {meta['day']}"
                    top_title = meta.get("title")
        return {
            "text": "\n\n".join(docs) if docs else f"Standard curriculum context reference for: {query}",
            "day": top_day,
            "title": top_title,
        }
    except Exception as exc:
        logger.warning("RAG retrieval error for query '%s': %s", query, exc)
        return {"text": f"Standard curriculum context reference for: {query}", "day": None, "title": None}


def retrieve_curriculum_text(query: str) -> str:
    """
    Search ChromaDB vector store using CurriculumRetriever and return formatted text.
    """
    details = retrieve_curriculum_details(query)
    return details.get("text", f"Standard curriculum context reference for: {query}")


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


def get_candidate_profile(candidate_info_or_id: Any) -> dict:
    """Retrieve structured candidate profile or return basic dict."""
    if isinstance(candidate_info_or_id, dict) and candidate_info_or_id:
        return candidate_info_or_id

    candidate_id = str(candidate_info_or_id) if candidate_info_or_id else "candidate-1"
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

def build_agent(session_state: dict) -> InterviewAgent:
    """
    Reconstruct an InterviewAgent instance strictly bound to the SQLite session dict.
    InterviewAgent is the SINGLE SOURCE OF TRUTH for workflow & state.
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

    current_t = session_state.get("current_topic")
    history = session_state.get("conversation_history", [])
    q_on_topic = sum(1 for h in history if isinstance(h, dict) and h.get("topic") == current_t) or 1

    llm = get_llm_client()
    agent = InterviewAgent(
        state=state,
        curriculum_retriever=retrieve_curriculum_details,
        llm_client=llm,
    )
    agent.questions_on_current_topic = q_on_topic

    if session_state.get("current_question"):
        agent.last_asked_question = session_state["current_question"]

    return agent


def extract_adaptive_signal(agent: InterviewAgent, last_turn_dict: Optional[dict] = None) -> Optional[dict]:
    """Helper to extract safe user-facing adaptive signal from agent state."""
    if not agent.state.evaluations:
        return None

    last_eval = agent.state.evaluations[-1]
    if isinstance(last_eval, dict):
        action = last_eval.get("action", ACTION_MODERATE)
        quality = last_eval.get("quality", "moderate")
        score = last_eval.get("score", 5.0)
    else:
        action = getattr(last_eval, "action", ACTION_MODERATE)
        quality = getattr(last_eval, "quality", "moderate")
        score = getattr(last_eval, "score", 5.0)

    reason_map = {
        ACTION_HARDER: "Strong technical answer demonstrated — increasing difficulty depth.",
        ACTION_CLARIFY: "Knowledge gap detected — tailoring clarification question.",
        ACTION_MODERATE: "Solid core explanation — maintaining current difficulty level.",
        ACTION_NEW_TOPIC: f"Topic depth satisfied — transitioning to next curriculum topic.",
    }
    safe_reason = reason_map.get(action, "Answer evaluated and adaptive path updated.")

    return {
        "action": action,
        "quality": quality,
        "score": score,
        "topic": agent.state.current_topic or "General Technical",
        "difficultyDelta": 1 if action == ACTION_HARDER else (-1 if action == ACTION_CLARIFY else 0),
        "reason": safe_reason,
    }


# ── Legacy/Compatibility Helpers (Delegating to InterviewAgent) ─────────────

async def generate_question(candidate_id: str, session_state: dict) -> dict:
    """Compatibility wrapper delegating question generation to InterviewAgent."""
    agent = build_agent(session_state)
    cand_profile = get_candidate_profile(candidate_id)
    if session_state.get("question_count", 0) == 0 and not session_state.get("covered_topics"):
        res = agent.start_interview(candidate_info=cand_profile)
        return {"question": res["question"], "topic": res["topic"]}
    
    context = retrieve_curriculum_text(agent.state.current_topic or "Technical")
    from agent.question_planner import PlannerAction
    action = PlannerAction(action_type=ACTION_MODERATE, target_topic=agent.state.current_topic)
    q = agent.generate_question(action, context)
    return {"question": q, "topic": agent.state.current_topic or "Technical"}


async def evaluate_answer(question: str, answer: str, session_state: dict) -> dict:
    """Compatibility wrapper delegating evaluation to InterviewAgent."""
    agent = build_agent(session_state)
    curriculum_context = retrieve_curriculum_text(session_state.get("current_topic") or "General")
    evaluation = agent_evaluate_answer(
        question=question,
        answer=answer,
        curriculum_context=curriculum_context,
        llm_client=agent.llm_client,
    )
    return {
        "score": evaluation.score,
        "evaluation": evaluation.reasoning or "Evaluated",
        "adaptive_signal": {
            "action": ACTION_MODERATE,
            "quality": evaluation.quality,
            "score": evaluation.score,
            "topic": session_state.get("current_topic") or "General",
            "difficultyDelta": 0,
            "reason": "Answer evaluated.",
        }
    }


async def generate_feedback(session_state: dict) -> dict:
    """Compatibility wrapper delegating feedback to InterviewAgent."""
    agent = build_agent(session_state)
    return agent.generate_feedback()
