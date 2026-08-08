"""
Agent Adapter — integration layer for the InterviewAgent.

# ──────────────────────────────────────────────────────────────────────────────
# INTEGRATION POINTS FOR PERSON 1 / PERSON 2
# ──────────────────────────────────────────────────────────────────────────────
# This module provides a clean adapter that the InterviewService calls.
# Currently it ships with a **stub implementation** that talks directly to
# Qwen3 via the Ollama HTTP API so the app works end-to-end for demos.
#
# When the real InterviewAgent / QuestionPlanner / AnswerEvaluator /
# CurriculumRetriever modules are ready, swap the stub methods below
# with calls to the real classes.  Only this file needs to change.
# ──────────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import json
import os
import logging
import random

import httpx

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen3")
OLLAMA_TIMEOUT = int(os.environ.get("OLLAMA_TIMEOUT", "120"))

# Curriculum topics that map roughly to "days" in a training programme.
# The real CurriculumRetriever would supply these dynamically.
CURRICULUM_TOPICS = [
    "Python Fundamentals",
    "Data Structures & Algorithms",
    "Object-Oriented Programming",
    "Database & SQL",
    "Web Development & APIs",
    "System Design",
    "Testing & Debugging",
    "DevOps & Deployment",
    "Machine Learning Basics",
    "Software Engineering Best Practices",
]


# ── Ollama helper ────────────────────────────────────────────────────────────

async def _call_ollama(prompt: str) -> str:
    """Send a prompt to Qwen3 through Ollama and return the generated text."""
    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            resp = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.7, "num_predict": 512},
                },
            )
            resp.raise_for_status()
            return resp.json().get("response", "").strip()
    except Exception as exc:
        logger.warning("Ollama call failed (%s), falling back to stub.", exc)
        return ""


# ── Public adapter methods ───────────────────────────────────────────────────

async def generate_question(
    candidate_id: str,
    session_state: dict,
) -> dict:
    """
    Generate the next interview question.

    Returns: {"question": str, "topic": str}

    # TODO: INTEGRATION POINT — replace with:
    #   from interview_agent import InterviewAgent
    #   agent = InterviewAgent()
    #   result = agent.generate_question(candidate_id, session_state)
    """
    covered = session_state.get("covered_topics", [])
    q_count = session_state.get("question_count", 0)

    # Pick a topic that hasn't been fully covered yet
    available = [t for t in CURRICULUM_TOPICS if t not in covered]
    if not available:
        available = CURRICULUM_TOPICS  # recycle if exhausted
    topic = random.choice(available)

    prompt = (
        f"/no_think\nYou are an expert technical interviewer conducting an adaptive interview.\n"
        f"The candidate ID is '{candidate_id}'.\n"
        f"This is question number {q_count + 1}.\n"
        f"Topics already covered: {', '.join(covered) if covered else 'none yet'}.\n"
        f"Current topic to ask about: {topic}.\n\n"
        f"Generate ONE clear, concise technical interview question about '{topic}'. "
        f"The question should be appropriate for a software engineering candidate and "
        f"require a detailed answer. Do not include the answer. "
        f"Return ONLY the question text, nothing else."
    )

    question = await _call_ollama(prompt)

    if not question:
        # Stub fallback when Ollama is unavailable
        question = _stub_question(topic, q_count)

    return {"question": question, "topic": topic}


async def evaluate_answer(
    question: str,
    answer: str,
    session_state: dict,
) -> dict:
    """
    Evaluate the candidate's answer.

    Returns: {"score": float, "evaluation": str}

    # TODO: INTEGRATION POINT — replace with:
    #   from answer_evaluator import AnswerEvaluator
    #   evaluator = AnswerEvaluator()
    #   result = evaluator.evaluate(question, answer, session_state)
    """
    prompt = (
        f"/no_think\nYou are an expert technical interviewer evaluating a candidate's answer.\n\n"
        f"Question: {question}\n\n"
        f"Candidate's Answer: {answer}\n\n"
        f"Evaluate the answer on a scale of 1-10 for:\n"
        f"- Technical accuracy\n"
        f"- Depth of understanding\n"
        f"- Clarity of explanation\n\n"
        f"Respond in EXACTLY this JSON format (no markdown, no extra text):\n"
        f'{{"score": <number 1-10>, "evaluation": "<brief 1-2 sentence evaluation>"}}'
    )

    raw = await _call_ollama(prompt)

    if raw:
        try:
            # Try to parse JSON from the response
            parsed = json.loads(_extract_json(raw))
            return {
                "score": max(1, min(10, float(parsed.get("score", 5)))),
                "evaluation": parsed.get("evaluation", "Answer evaluated."),
            }
        except (json.JSONDecodeError, ValueError, TypeError):
            logger.warning("Could not parse evaluation JSON, using heuristic.")

    # Stub fallback — basic heuristic
    return _stub_evaluate(answer)


async def generate_feedback(session_state: dict) -> dict:
    """
    Generate final interview feedback.

    Returns: {"summary": str, "strengths": [str], "gaps": [str], "next": [str]}

    # TODO: INTEGRATION POINT — replace with:
    #   from interview_agent import InterviewAgent
    #   agent = InterviewAgent()
    #   result = agent.generate_feedback(session_state)
    """
    answers_data = session_state.get("answers", [])
    scores = session_state.get("scores", [])
    topics = session_state.get("covered_topics", [])
    avg_score = sum(scores) / len(scores) if scores else 5.0

    # Build a summary of all Q&A for context
    qa_summary = "\n".join(
        f"Q{i+1} [{a.get('topic', '')}]: {a.get('question', '')[:100]}... → Score: {a.get('score', 'N/A')}"
        for i, a in enumerate(answers_data)
    )

    prompt = (
        f"/no_think\nYou are an expert technical interviewer writing a final assessment.\n\n"
        f"Topics covered: {', '.join(topics)}\n"
        f"Average score: {avg_score:.1f}/10\n"
        f"Question summary:\n{qa_summary}\n\n"
        f"Write a final interview assessment. Respond in EXACTLY this JSON format "
        f"(no markdown, no extra text):\n"
        f'{{"summary": "<2-3 sentence overall summary>",'
        f' "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],'
        f' "gaps": ["<gap 1>", "<gap 2>"],'
        f' "next": ["<next topic 1>", "<next topic 2>", "<next topic 3>"]}}'
    )

    raw = await _call_ollama(prompt)

    if raw:
        try:
            parsed = json.loads(_extract_json(raw))
            return {
                "summary": parsed.get("summary", "Interview completed."),
                "strengths": parsed.get("strengths", []),
                "gaps": parsed.get("gaps", []),
                "next": parsed.get("next", []),
            }
        except (json.JSONDecodeError, ValueError, TypeError):
            logger.warning("Could not parse feedback JSON, using stub.")

    # Stub fallback
    return _stub_feedback(topics, avg_score)


# ── Stub / fallback implementations ─────────────────────────────────────────

_STUB_QUESTIONS = {
    "Python Fundamentals": "Explain the difference between a list and a tuple in Python. When would you choose one over the other?",
    "Data Structures & Algorithms": "Describe how a hash map works internally. What is the time complexity of lookup, insertion, and deletion?",
    "Object-Oriented Programming": "Explain the SOLID principles with a practical example of how you would apply the Single Responsibility Principle.",
    "Database & SQL": "What is the difference between an INNER JOIN and a LEFT JOIN? Provide an example scenario for each.",
    "Web Development & APIs": "Explain the difference between REST and GraphQL. What are the trade-offs of each approach?",
    "System Design": "How would you design a URL shortening service like bit.ly? Discuss the key components and scalability considerations.",
    "Testing & Debugging": "What is the difference between unit testing, integration testing, and end-to-end testing? When should you use each?",
    "DevOps & Deployment": "Explain the concept of CI/CD pipelines. What stages would you include in a production deployment pipeline?",
    "Machine Learning Basics": "Explain the difference between supervised and unsupervised learning. Give an example use case for each.",
    "Software Engineering Best Practices": "What strategies would you use to manage technical debt in a growing codebase?",
}


def _stub_question(topic: str, q_count: int) -> str:
    return _STUB_QUESTIONS.get(topic, f"Tell me about your experience with {topic}. What are the key concepts?")


def _stub_evaluate(answer: str) -> dict:
    length = len(answer.strip())
    if length < 20:
        return {"score": 3.0, "evaluation": "Answer is too brief. More detail needed."}
    elif length < 100:
        return {"score": 5.0, "evaluation": "Reasonable answer but could be more thorough."}
    elif length < 300:
        return {"score": 7.0, "evaluation": "Good answer with decent depth of understanding."}
    else:
        return {"score": 8.5, "evaluation": "Comprehensive and well-structured answer."}


def _stub_feedback(topics: list[str], avg_score: float) -> dict:
    strengths = []
    gaps = []

    if avg_score >= 7:
        strengths.extend(["Strong technical fundamentals", "Clear communication"])
    elif avg_score >= 5:
        strengths.append("Adequate understanding of core concepts")
    else:
        gaps.append("Needs significant improvement in technical depth")

    if len(topics) >= 4:
        strengths.append(f"Broad coverage across {len(topics)} topic areas")
    else:
        gaps.append("Limited topic coverage")

    for t in topics[:3]:
        strengths.append(f"Demonstrated knowledge in {t}")

    uncovered = [t for t in CURRICULUM_TOPICS if t not in topics]
    next_topics = uncovered[:3] if uncovered else ["Advanced System Design", "Performance Optimization"]

    if not gaps:
        gaps = ["Could provide more real-world examples", "Some answers lacked depth"]

    return {
        "summary": (
            f"The candidate completed {len(topics)} topic areas with an average score "
            f"of {avg_score:.1f}/10. "
            f"{'Overall strong performance.' if avg_score >= 7 else 'Room for improvement in several areas.'}"
        ),
        "strengths": strengths[:5],
        "gaps": gaps[:3],
        "next": next_topics[:4],
    }


def _extract_json(text: str) -> str:
    """Try to extract JSON from a string that may contain surrounding text."""
    # Find first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]
    return text
