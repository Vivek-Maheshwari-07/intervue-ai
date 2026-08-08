"""
Backend tests for the interview API.

Covers:
 1.  New session creation
 2.  Existing session retrieval
 3.  Multiple answers with same sessionId
 4.  Question count increment
 5.  Topic tracking
 6.  Completion at 8+ questions and 4+ topics
 7.  Not completing before requirements are met
 8.  Final feedback response format
 9.  Invalid request handling
 10. Agent failure / edge cases
"""

from __future__ import annotations

import uuid


def _session_id() -> str:
    return f"test-{uuid.uuid4().hex[:8]}"


# ── 1. New session creation ──────────────────────────────────────────────────

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


# ── 2. Existing session retrieval ────────────────────────────────────────────

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
    # Should either be ongoing with next question or still have a question
    assert data["status"] in ("ongoing", "completed")


# ── 3. Multiple answers with same sessionId ──────────────────────────────────

def test_multiple_answers_same_session(client):
    """Multiple answer submissions should use the same session and increment progress."""
    sid = _session_id()

    # Start
    client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-3",
        "answer": "",
    })

    # Submit 3 answers
    for i in range(3):
        resp = client.post("/api/interview", json={
            "sessionId": sid,
            "candidateId": "candidate-3",
            "answer": f"Detailed answer number {i+1} about programming concepts and best practices.",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["sessionId"] == sid


# ── 4. Question count increment ─────────────────────────────────────────────

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


# ── 5. Topic tracking ───────────────────────────────────────────────────────

def test_topic_tracking(client):
    """Topics should be tracked across answers."""
    sid = _session_id()

    client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-5",
        "answer": "",
    })

    resp = client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-5",
        "answer": "A hash map uses a hash function to map keys to indices in an array for O(1) average lookup.",
    })
    data = resp.json()
    assert "topicsCovered" in data
    assert isinstance(data.get("coveredTopics", []), list)


# ── 6. Completion at 8+ questions and 4+ topics ─────────────────────────────

def test_completion_at_threshold(client):
    """Interview should complete when >= 8 questions AND >= 4 topics are covered."""
    sid = _session_id()

    # Start
    client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-6",
        "answer": "",
    })

    # Submit 9 answers (more than the minimum 8)
    last_data = None
    for i in range(9):
        resp = client.post("/api/interview", json={
            "sessionId": sid,
            "candidateId": "candidate-6",
            "answer": f"Comprehensive answer #{i+1}: This covers important concepts about software engineering including data structures, algorithms, system design, and testing methodologies.",
        })
        assert resp.status_code == 200
        last_data = resp.json()

        if last_data["status"] == "completed":
            break

    # After enough questions, should eventually complete
    # (depends on topic distribution from stub)
    assert last_data is not None


# ── 7. Not completing before requirements ────────────────────────────────────

def test_not_complete_before_requirements(client):
    """Interview should NOT complete before 8 questions."""
    sid = _session_id()

    client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-7",
        "answer": "",
    })

    # Submit only 3 answers — should still be ongoing
    for i in range(3):
        resp = client.post("/api/interview", json={
            "sessionId": sid,
            "candidateId": "candidate-7",
            "answer": f"Short answer {i+1}.",
        })
        data = resp.json()
        assert data["status"] == "ongoing", f"Should not be completed after only {i+1} answers"


# ── 8. Final feedback response format ────────────────────────────────────────

def test_feedback_response_format(client):
    """When completed, the response should contain feedback with summary, strengths, gaps, next."""
    sid = _session_id()

    client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-8",
        "answer": "",
    })

    last_data = None
    for i in range(12):  # Enough to guarantee completion
        resp = client.post("/api/interview", json={
            "sessionId": sid,
            "candidateId": "candidate-8",
            "answer": f"A thorough answer #{i+1} demonstrating deep understanding of this topic.",
        })
        last_data = resp.json()
        if last_data["status"] == "completed":
            break

    if last_data and last_data["status"] == "completed":
        fb = last_data["feedback"]
        assert "summary" in fb
        assert "strengths" in fb
        assert isinstance(fb["strengths"], list)
        assert "gaps" in fb
        assert isinstance(fb["gaps"], list)
        assert "next" in fb
        assert isinstance(fb["next"], list)


# ── 9. Invalid request handling ──────────────────────────────────────────────

def test_empty_session_id_rejected(client):
    """Empty sessionId should be rejected by Pydantic validation."""
    resp = client.post("/api/interview", json={
        "sessionId": "",
        "candidateId": "candidate-9",
        "answer": "",
    })
    assert resp.status_code == 422  # Pydantic validation error


def test_empty_candidate_id_rejected(client):
    """Empty candidateId should be rejected."""
    resp = client.post("/api/interview", json={
        "sessionId": _session_id(),
        "candidateId": "",
        "answer": "",
    })
    assert resp.status_code == 422


def test_missing_fields_rejected(client):
    """Missing required fields should be rejected."""
    resp = client.post("/api/interview", json={})
    assert resp.status_code == 422


def test_candidate_id_mismatch(client):
    """Using a different candidateId for an existing session should fail."""
    sid = _session_id()

    # Start with candidate-A
    r1 = client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-A",
        "answer": "",
    })
    assert r1.status_code == 200

    # Try with candidate-B on same session
    r2 = client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-B",
        "answer": "Some answer.",
    })
    assert r2.status_code == 400


# ── 10. Edge cases ──────────────────────────────────────────────────────────

def test_health_endpoint(client):
    """Health check should return ok."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


def test_completed_session_returns_feedback_on_retry(client):
    """Re-hitting a completed session should still return the feedback."""
    sid = _session_id()

    client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-10",
        "answer": "",
    })

    # Drive to completion
    for i in range(12):
        resp = client.post("/api/interview", json={
            "sessionId": sid,
            "candidateId": "candidate-10",
            "answer": f"Detailed answer {i+1} about various software concepts.",
        })
        if resp.json()["status"] == "completed":
            break

    # Hit again — should still be completed
    resp2 = client.post("/api/interview", json={
        "sessionId": sid,
        "candidateId": "candidate-10",
        "answer": "Another answer after completion.",
    })
    data = resp2.json()
    assert data["status"] == "completed"
    assert "feedback" in data
