"""Session CRUD operations against SQLite."""

from __future__ import annotations

import json
from datetime import datetime, timezone

from database.database import get_db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Create ───────────────────────────────────────────────────────────────────

async def create_session(session_id: str, candidate_id: str) -> dict:
    """Insert a brand-new session row and return it as a dict."""
    now = _now()
    db = await get_db()
    try:
        await db.execute(
            """
            INSERT INTO interview_sessions
                (session_id, candidate_id, question_count, covered_days,
                 covered_topics, conversation_history, answers, scores,
                 status, current_question, current_topic, feedback,
                 created_at, updated_at)
            VALUES (?, ?, 0, '[]', '[]', '[]', '[]', '[]',
                    'ongoing', '', '', '', ?, ?)
            """,
            (session_id, candidate_id, now, now),
        )
        await db.commit()
    finally:
        await db.close()

    return await get_session(session_id)


# ── Read ─────────────────────────────────────────────────────────────────────

async def get_session(session_id: str) -> dict | None:
    """Fetch a session by ID. Returns None if not found."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM interview_sessions WHERE session_id = ?",
            (session_id,),
        )
        row = await cursor.fetchone()
    finally:
        await db.close()

    if row is None:
        return None

    return _row_to_dict(row)


# ── Update helpers ───────────────────────────────────────────────────────────

async def update_session(session_id: str, **fields) -> dict | None:
    """Generic partial update. Pass column names as keyword arguments."""
    if not fields:
        return await get_session(session_id)

    fields["updated_at"] = _now()
    set_clause = ", ".join(f"{k} = ?" for k in fields)
    values = list(fields.values()) + [session_id]

    db = await get_db()
    try:
        await db.execute(
            f"UPDATE interview_sessions SET {set_clause} WHERE session_id = ?",
            values,
        )
        await db.commit()
    finally:
        await db.close()

    return await get_session(session_id)


async def save_answer(
    session_id: str,
    question: str,
    answer: str,
    score: float,
    topic: str,
) -> dict | None:
    """Append an answer + update conversation history, answers, scores, and topic list."""
    session = await get_session(session_id)
    if session is None:
        return None

    history: list = session["conversation_history"]
    answers: list = session["answers"]
    scores: list = session["scores"]
    topics: list = session["covered_topics"]

    # Append AI question to history (if not already the last entry)
    if not history or history[-1].get("content") != question:
        history.append({"role": "interviewer", "content": question, "topic": topic})
    # Append candidate answer
    history.append({"role": "candidate", "content": answer})

    answers.append({"question": question, "answer": answer, "score": score, "topic": topic})
    scores.append(score)

    if topic and topic not in topics:
        topics.append(topic)

    return await update_session(
        session_id,
        conversation_history=json.dumps(history),
        answers=json.dumps(answers),
        scores=json.dumps(scores),
        covered_topics=json.dumps(topics),
    )


async def increment_question_count(session_id: str) -> dict | None:
    """Bump question_count by 1."""
    session = await get_session(session_id)
    if session is None:
        return None
    return await update_session(
        session_id,
        question_count=session["question_count"] + 1,
    )


async def update_topics(session_id: str, topics: list[str]) -> dict | None:
    """Replace the full covered_topics list."""
    return await update_session(
        session_id,
        covered_topics=json.dumps(topics),
    )


async def save_score(session_id: str, score: float) -> dict | None:
    """Append a single score."""
    session = await get_session(session_id)
    if session is None:
        return None
    scores: list = session["scores"]
    scores.append(score)
    return await update_session(session_id, scores=json.dumps(scores))


async def complete_session(session_id: str, feedback: dict) -> dict | None:
    """Mark session as completed with final feedback."""
    return await update_session(
        session_id,
        status="completed",
        feedback=json.dumps(feedback),
    )


# ── Internal ─────────────────────────────────────────────────────────────────

JSON_FIELDS = {
    "covered_days",
    "covered_topics",
    "conversation_history",
    "answers",
    "scores",
}


def _row_to_dict(row) -> dict:
    """Convert an aiosqlite Row to a plain dict, deserialising JSON columns."""
    d = dict(row)
    for key in JSON_FIELDS:
        if key in d and isinstance(d[key], str):
            try:
                d[key] = json.loads(d[key])
            except (json.JSONDecodeError, TypeError):
                d[key] = []
    # feedback may be a JSON object or empty string
    if "feedback" in d and isinstance(d["feedback"], str) and d["feedback"]:
        try:
            d["feedback"] = json.loads(d["feedback"])
        except (json.JSONDecodeError, TypeError):
            pass
    return d
