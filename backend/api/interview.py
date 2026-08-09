"""Interview API endpoint adhering to Technical Specification."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from models.schemas import InterviewRequest, InterviewOngoingResponse, InterviewCompletedResponse, ErrorResponse
from services.interview_service import process_interview_turn
from database import session_manager as sm

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

    Supports both Technical Specification contract format:
    START: {"sessionId": "...", "candidate": {...}}
    TURN: {"sessionId": "...", "message": "..."}

    And backwards-compatible format:
    {"sessionId": "...", "candidateId": "...", "answer": "..."}
    """
    session_id = request.sessionId.strip() if request.sessionId else ""
    if not session_id:
        raise HTTPException(
            status_code=400,
            detail="sessionId must not be empty.",
        )

    cand_id = request.get_candidate_id()
    msg_text = request.get_message_text()

    # Check if existing session exists in database
    existing_session = await sm.get_session(session_id)

    # 1. START Validation: If new session or no existing question, candidate is required
    if existing_session is None:
        if not cand_id and not request.get_candidate_info():
            raise HTTPException(
                status_code=400,
                detail="candidate or candidateId is required to start a new interview session.",
            )

    # 2. TURN Validation: If answer/message field was provided in payload, it cannot be empty/whitespace
    if request.message is not None or request.answer is not None:
        # If continuing an existing ongoing session, message cannot be empty whitespace
        if existing_session is not None and existing_session.get("current_question"):
            if not msg_text.strip():
                raise HTTPException(
                    status_code=400,
                    detail="message cannot be empty or whitespace on an interview turn.",
                )

    # Use candidate ID from request if provided, otherwise from existing session
    effective_cand_id = cand_id or (existing_session.get("candidate_id") if existing_session else "default-candidate")

    try:
        result = await process_interview_turn(
            session_id=session_id,
            candidate_id=effective_cand_id,
            answer=msg_text,
            candidate_info=request.get_candidate_info(),
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
