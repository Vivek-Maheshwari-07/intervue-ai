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

class AdaptiveSignal(BaseModel):
    """Evaluation signal metadata returned after answer evaluation."""
    action: str = Field(..., description="HARDER, CLARIFY, MODERATE, NEW_TOPIC")
    quality: str = Field(..., description="strong, moderate, weak")
    score: float = Field(..., description="Evaluation score 0-10")
    topic: str = Field(..., description="Topic of the question evaluated")
    difficultyDelta: int = Field(default=0, description="+1, 0, -1")
    reason: str = Field(default="", description="Safe user-facing summary of why action was taken")


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
    adaptiveSignal: AdaptiveSignal | None = None


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
