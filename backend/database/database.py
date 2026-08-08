"""SQLite database setup and connection management."""

from __future__ import annotations

import aiosqlite
import os

DB_PATH = os.environ.get("INTERVIEW_DB_PATH", os.path.join(os.path.dirname(__file__), "..", "interview_sessions.db"))

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS interview_sessions (
    session_id          TEXT PRIMARY KEY,
    candidate_id        TEXT NOT NULL,
    question_count      INTEGER DEFAULT 0,
    covered_days        TEXT DEFAULT '[]',
    covered_topics      TEXT DEFAULT '[]',
    conversation_history TEXT DEFAULT '[]',
    answers             TEXT DEFAULT '[]',
    scores              TEXT DEFAULT '[]',
    status              TEXT DEFAULT 'ongoing',
    current_question    TEXT DEFAULT '',
    current_topic       TEXT DEFAULT '',
    feedback            TEXT DEFAULT '',
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL
);
"""


async def get_db() -> aiosqlite.Connection:
    """Open a connection with row-factory enabled."""
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db


async def init_db() -> None:
    """Create tables if they don't exist yet."""
    db = await get_db()
    try:
        await db.execute(CREATE_TABLE_SQL)
        await db.commit()
    finally:
        await db.close()
