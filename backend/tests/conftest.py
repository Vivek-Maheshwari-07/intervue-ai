"""Shared test fixtures."""

from __future__ import annotations

import os
import sys
import tempfile

import pytest
import pytest_asyncio

# Ensure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Use a temporary database for every test session
_tmp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ["INTERVIEW_DB_PATH"] = _tmp_db.name
_tmp_db.close()


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture(scope="session")
async def init_database():
    """Initialise the test database once per session."""
    from database.database import init_db

    await init_db()


@pytest.fixture()
def client(init_database):
    """Synchronous TestClient wrapping the FastAPI app."""
    from fastapi.testclient import TestClient
    from main import app

    with TestClient(app) as c:
        yield c
