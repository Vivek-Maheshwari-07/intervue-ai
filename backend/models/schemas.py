"""Pydantic models for request/response validation."""

from __future__ import annotations

from pydantic import BaseModel, Field


# ── Request ──────────────────────────────────────────────────────────────────

from typing import Any, Optional, Union


class InterviewRequest(BaseModel):
    """Incoming payload for interview START or TURN."""

    sessionId: str = Field(..., min_length=1, description="Unique session identifier")
    candidateId: Optional[str] = Field(default=None, description="Candidate identifier string")
    candidate: Optional[Union[dict[str, Any], str]] = Field(default=None, description="Candidate profile object or ID string")
    message: Optional[str] = Field(default=None, description="Candidate answer message for TURN request")
    answer: Optional[str] = Field(default=None, description="Candidate answer string (alias for message)")

    def get_candidate_id(self) -> str:
        """Resolve candidate identifier string from candidate object or candidateId field."""
        if isinstance(self.candidate, str) and self.candidate.strip():
            return self.candidate.strip()
        if isinstance(self.candidate, dict):
            member = self.candidate.get("member", {})
            cand_id = self.candidate.get("candidate_id") or self.candidate.get("id") or member.get("id")
            if isinstance(cand_id, str) and cand_id.strip():
                return cand_id.strip()
        if self.candidateId and self.candidateId.strip():
            return self.candidateId.strip()
        return ""

    def get_candidate_info(self) -> dict[str, Any] | str:
        """Resolve full candidate payload or candidate string ID."""
        if isinstance(self.candidate, dict) and self.candidate:
            return self.candidate
        cand_id = self.get_candidate_id()
        if cand_id:
            return {"candidate_id": cand_id}
        return {}

    def get_message_text(self) -> str:
        """Resolve candidate message text from message or answer."""
        if self.message is not None:
            return self.message
        if self.answer is not None:
            return self.answer
        return ""


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
    reply: str
    done: bool = False
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
    reply: str = "Interview completed."
    done: bool = True
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
