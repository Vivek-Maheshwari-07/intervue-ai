"""Interview API endpoint."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from models.schemas import InterviewRequest, InterviewOngoingResponse, InterviewCompletedResponse, ErrorResponse
from services.interview_service import process_interview_turn

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["interview"])


@router.post(
    "/interview",
    response_model=InterviewOngoingResponse | InterviewCompletedResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        404: {"model": ErrorResponse, "description": "Session not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
async def interview_endpoint(request: InterviewRequest):
    """
    Handle a single interview turn.

    - Send an empty `answer` to start a new interview and receive the first question.
    - Send a non-empty `answer` to submit a response and receive the next question
      or final feedback.
    """
    # Validate candidateId
    if not request.candidateId.strip():
        raise HTTPException(
            status_code=400,
            detail="candidateId must not be empty.",
        )

    try:
        result = await process_interview_turn(
            session_id=request.sessionId,
            candidate_id=request.candidateId.strip(),
            answer=request.answer,
        )
        return result

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    except Exception as exc:
        logger.exception("Unexpected error processing interview turn")
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred. Please try again.",
        )
