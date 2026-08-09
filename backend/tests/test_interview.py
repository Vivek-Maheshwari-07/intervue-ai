"""
Backend tests for the interview API and Technical Specification contract.

Covers:
 1.  Technical Specification START request (sessionId + candidate -> reply, done=False)
 2.  Technical Specification TURN request (sessionId + message -> reply, done=False)
 3.  Technical Specification completion response (done=True, feedback)
 4.  Backwards-compatible API request/response validation
 5.  InterviewAgent ownership of orchestration & completion
 6.  Empty message validation rejection on turn
 7.  Missing candidate on START rejection
 8.  Session state persistence across turns
 9.  Candidate ID mismatch rejection
 10. Health check endpoint
"""

from __future__ import annotations

import uuid
import inspect
from services import interview_service


def _session_id() -> str:
    return f"test-{uuid.uuid4().hex[:8]}"


# ── 1. Single Source of Truth Checks ──────────────────────────────────────────

def test_interview_service_uses_interview_agent():
    """Verify that interview_service does not define a separate is_interview_complete function."""
    assert not hasattr(interview_service, "is_interview_complete"), (
        "interview_service should NOT define a separate is_interview_complete() function; "
        "InterviewAgent must be the single source of truth for completion!"
    )


# ── 2. Technical Specification Contract Tests ─────────────────────────────────

def test_tech_spec_start_request(client):
    """START request with candidate object and sessionId returns reply and done=False."""
    sid = _session_id()
    resp = client.post("/api/interview", json={
        "sessionId": sid,
        "candidate": {
            "candidate_id": "CAND-001",
            "name": "Sarah Johnson",
            "jobRole": "Senior Backend Engineer"
        }
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["sessionId"] == sid
    assert "reply" in data
    assert len(data["reply"]) > 0
    assert data["done"] is False
    assert data["status"] == "ongoing"


def test_tech_spec_turn_request(client):
    """TURN request with message and sessionId returns reply and done=False."""
    sid = _session_id()

    # Start
    client.post("/api/interview", json={
        "sessionId": sid,
        "candidate": {"id": "CAND-001"}
    })

    # Turn
    resp = client.post("/api/interview", json={
        "sessionId": sid,
        "message": "I build distributed microservices using FastAPI, Redis caching, and PostgreSQL."
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["sessionId"] == sid
    assert "reply" in data
    assert isinstance(data["done"], bool)


def test_tech_spec_completion(client):
    """Interview completion returns done=True and structured feedback."""
    sid = _session_id()

    # Start
    client.post("/api/interview", json={
        "sessionId": sid,
        "candidate": {"id": "CAND-001"}
    })

    # Drive to completion with 9 turns
    last_data = None
    for i in range(12):
        resp = client.post("/api/interview", json={
            "sessionId": sid,
            "message": f"Detailed answer #{i+1} demonstrating solid engineering principles in system design, database indexing, and API performance."
        })
        assert resp.status_code == 200
        last_data = resp.json()
        if last_data.get("done") is True or last_data.get("status") == "completed":
            break

    assert last_data is not None
    assert last_data["done"] is True
    assert last_data["status"] == "completed"
    assert "feedback" in last_data
    assert "summary" in last_data["feedback"]


# ── 3. Request Validation Tests ───────────────────────────────────────────────

def test_empty_session_id_rejected(client):
    """Empty sessionId should be rejected."""
    resp = client.post("/api/interview", json={
        "sessionId": "",
        "candidateId": "candidate-9",
        "answer": "",
    })
    assert resp.status_code in (400, 422)


def test_missing_candidate_on_start_rejected(client):
    """Missing candidate/candidateId on new session start should be rejected."""
    resp = client.post("/api/interview", json={
        "sessionId": _session_id(),
    })
    assert resp.status_code in (400, 422)


def test_empty_message_on_turn_rejected(client):
    """Empty or whitespace message on an ongoing session turn should be rejected."""
    sid = _session_id()

    # Start
    client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-val",
        "answer": "",
    })

    # Submit whitespace answer
    resp = client.post("/api/interview", json={
        "sessionId": sid,
        "message": "    "
    })
    assert resp.status_code == 400


# ── 4. Backwards-Compatibility API Tests ──────────────────────────────────────

def test_new_session_returns_question(client):
    """Starting a new interview should return an ongoing response with a question."""
    sid = _session_id()
    resp = client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-1",
        "answer": "",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ongoing"
    assert data["sessionId"] == sid
    assert "question" in data
    assert len(data["question"]) > 0
    assert data["questionNumber"] == 1


def test_existing_session_continues(client):
    """Submitting an answer to an existing session should return the next question."""
    sid = _session_id()

    # Start
    r1 = client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-2",
        "answer": "",
    })
    assert r1.status_code == 200

    # Answer
    r2 = client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-2",
        "answer": "Python is a high-level interpreted language used for web development, data science, and automation.",
    })
    assert r2.status_code == 200
    data = r2.json()
    assert data["sessionId"] == sid
    assert data["status"] in ("ongoing", "completed")


def test_multiple_answers_same_session(client):
    """Multiple answer submissions should use the same session and increment progress."""
    sid = _session_id()

    client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-3",
        "answer": "",
    })

    for i in range(3):
        resp = client.post("/api/interview", json={
            "sessionId": sid,
            "candidateId": "candidate-3",
            "answer": f"Detailed answer number {i+1} about programming concepts and best practices.",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["sessionId"] == sid


def test_question_count_increments(client):
    """Each answer should increment the question number."""
    sid = _session_id()

    r1 = client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-4",
        "answer": "",
    })
    assert r1.json()["questionNumber"] == 1

    r2 = client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-4",
        "answer": "Lists are mutable, tuples are immutable in Python.",
    })
    data = r2.json()
    assert data["questionNumber"] >= 2


def test_not_complete_before_requirements(client):
    """Interview should NOT complete before 8 questions."""
    sid = _session_id()

    client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-7",
        "answer": "",
    })

    for i in range(3):
        resp = client.post("/api/interview", json={
            "sessionId": sid,
            "candidateId": "candidate-7",
            "answer": f"Short answer {i+1}.",
        })
        data = resp.json()
        assert data["status"] == "ongoing", f"Should not be completed after only {i+1} answers"


def test_candidate_id_mismatch(client):
    """Using a different candidateId for an existing session should fail."""
    sid = _session_id()

    r1 = client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-A",
        "answer": "",
    })
    assert r1.status_code == 200

    r2 = client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-B",
        "answer": "Some answer.",
    })
    assert r2.status_code == 400


def test_health_endpoint(client):
    """Health check should return ok."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
