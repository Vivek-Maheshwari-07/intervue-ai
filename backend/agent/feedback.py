"""
Final Feedback Generator
Produces structured final feedback following the required schema:
{
  "summary": "...",
  "strengths": [...],
  "gaps": [...],
  "next": [...]
}
Aggregates performance scores and evaluation turn records from InterviewState.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from .state import InterviewState


@dataclass
class FeedbackResult:
    """Dataclass matching the required final feedback schema."""
    summary: str
    strengths: List[str] = field(default_factory=list)
    gaps: List[str] = field(default_factory=list)
    next: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dict matching exact hackathon JSON spec."""
        return {
            "summary": self.summary,
            "strengths": self.strengths,
            "gaps": self.gaps,
            "next": self.next,
        }


def generate_final_feedback(
    state: InterviewState,
    llm_generator_fn: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Generate final candidate feedback based on state history and scores.
    Uses custom/LLM generator if provided, otherwise computes deterministic fallback.
    """
    # Safe handling if no questions were asked
    if state.question_count == 0 or not state.conversation_history:
        return FeedbackResult(
            summary="Interview session ended before questions were answered.",
            strengths=[],
            gaps=["Insufficient evaluation data collected."],
            next=["Schedule a complete interview session."]
        ).to_dict()

    # Delegate to LLM generator if available
    if llm_generator_fn is not None:
        try:
            llm_result = llm_generator_fn(state)
            if isinstance(llm_result, dict) and all(k in llm_result for k in ["summary", "strengths", "gaps", "next"]):
                return llm_result
        except Exception:
            pass # Fallback to deterministic synthesis below

    # Deterministic Aggregation
    avg_score = state.get_average_score()
    candidate_name = state.candidate_info.get("name", "Candidate")
    role = state.candidate_info.get("role", "Software Engineer")

    # Collect strengths and gaps from turn evaluations
    all_strengths: List[str] = []
    all_gaps: List[str] = []

    for turn in state.conversation_history:
        score = turn.get("score")
        topic = turn.get("topic", "General Technical")
        quality = turn.get("quality", "moderate")

        if score is not None and score >= 7.0:
            all_strengths.append(f"Demonstrated solid competency in {topic} (Turn {turn.get('turn_index')})")
        elif score is not None and score <= 3.5:
            all_gaps.append(f"Needs improvement in {topic} core concepts (Turn {turn.get('turn_index')})")

    # De-duplicate while preserving order
    unique_strengths = list(dict.fromkeys(all_strengths))
    unique_gaps = list(dict.fromkeys(all_gaps))

    # Formulate summary
    if avg_score >= 8.0:
        summary_text = f"{candidate_name} performed exceptionally well across {state.get_unique_covered_count()} technical topics with an average score of {avg_score}/10, demonstrating senior readiness for {role} responsibilities."
    elif avg_score >= 5.5:
        summary_text = f"{candidate_name} showed good core capabilities with an average score of {avg_score}/10 across {state.get_unique_covered_count()} topics, with minor technical gaps to address."
    else:
        summary_text = f"{candidate_name} completed {state.question_count} interview questions with an average score of {avg_score}/10. Found foundational gaps in several covered topics."

    # Default fallbacks if empty
    if not unique_strengths:
        unique_strengths = ["Completed all technical interview questions", "Engaged with interviewer prompts"]
    if not unique_gaps:
        unique_gaps = ["Could provide more concrete code examples under time pressure"]

    # Formulate recommended next steps
    next_steps = []
    if avg_score >= 7.5:
        next_steps.append("Proceed to team lead / architectural deep dive round.")
        next_steps.append("Assign high-autonomy system design ownership tasks.")
    elif avg_score >= 5.0:
        next_steps.append("Review specific curriculum modules for identified gaps.")
        next_steps.append("Conduct a follow-up targeted technical session.")
    else:
        next_steps.append("Review foundational technical documentation and algorithm patterns.")
        next_steps.append("Re-evaluate after 4 weeks of self-guided study.")

    result = FeedbackResult(
        summary=summary_text,
        strengths=unique_strengths,
        gaps=unique_gaps,
        next=next_steps,
    )

    return result.to_dict()
