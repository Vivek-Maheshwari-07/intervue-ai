"""Pydantic models for request/response validation."""

from __future__ import annotations

from pydantic import BaseModel, Field


# ── Request ──────────────────────────────────────────────────────────────────

class InterviewRequest(BaseModel):
    """Incoming payload for every interview turn."""

    sessionId: str = Field(..., min_length=1, description="Unique session identifier")
    candidateId: str = Field(..., min_length=1, description="Candidate identifier")
    answer: str = Field(default="", description="Candidate's answer (empty to start)")


# ── Response – ongoing ───────────────────────────────────────────────────────

class InterviewOngoingResponse(BaseModel):
    """Returned while the interview is still in progress."""

    sessionId: str
    status: str = "ongoing"
    question: str
    questionNumber: int
    totalQuestions: int = 8
    topicsCovered: int
    coveredTopics: list[str] = []
    conversationHistory: list[dict] = []


# ── Response – completed ─────────────────────────────────────────────────────

class FeedbackPayload(BaseModel):
    summary: str = ""
    strengths: list[str] = []
    gaps: list[str] = []
    next: list[str] = []


class InterviewCompletedResponse(BaseModel):
    """Returned once the interview is finished."""

    sessionId: str
    status: str = "completed"
    feedback: FeedbackPayload
    questionNumber: int
    totalQuestions: int = 8
    topicsCovered: int
    coveredTopics: list[str] = []
    conversationHistory: list[dict] = []


# ── Error ────────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    detail: str
    code: str = "INTERNAL_ERROR"
