"""
Adaptive Question Planner
Decides the next interviewer action (HARDER, CLARIFY, MODERATE, NEW_TOPIC)
based on candidate evaluation quality and topic coverage state.
The policy decision is deterministic and code-enforced.
"""

from dataclasses import dataclass
from typing import Optional, List
from .evaluator import AnswerEvaluation, QUALITY_WEAK, QUALITY_MODERATE, QUALITY_STRONG, QUALITY_EXCELLENT

ACTION_HARDER = "HARDER"
ACTION_CLARIFY = "CLARIFY"
ACTION_MODERATE = "MODERATE"
ACTION_NEW_TOPIC = "NEW_TOPIC"


@dataclass
class PlannerAction:
    """Action recommendation from the Question Planner policy engine."""
    action_type: str                  # HARDER | CLARIFY | MODERATE | NEW_TOPIC
    target_topic: Optional[str] = None
    target_day: Optional[str] = None
    difficulty_delta: int = 0         # e.g., +1 for HARDER, -1 for CLARIFY, 0 for MODERATE
    reasoning: str = ""


class QuestionPlanner:
    """
    Deterministic Question Planner policy engine.
    Controls interview progression without delegating policy logic to the LLM.
    """

    def __init__(self, available_topics: Optional[List[str]] = None, available_days: Optional[List[str]] = None):
        self.available_topics = available_topics or [
            "Data Structures & Algorithmic Efficiency",
            "System Architecture & Scaling",
            "Database Design & Query Optimization",
            "API Design & Async Queues",
            "Distributed Consensus & Failover",
            "Security & Authentication",
        ]
        self.available_days = available_days or [
            "Day 1: Fundamentals & Code Quality",
            "Day 2: System Design & Microservices",
            "Day 3: Databases & Caching",
            "Day 4: Reliability & Distributed Systems",
            "Day 5: DevOps & Monitoring",
        ]

    def plan_next_action(
        self,
        evaluation: AnswerEvaluation,
        current_topic: Optional[str] = None,
        current_day: Optional[str] = None,
        covered_topics: Optional[List[str]] = None,
        covered_days: Optional[List[str]] = None,
        questions_on_current_topic: int = 1,
        total_questions: int = 0,
        required_unique_units: int = 4,
    ) -> PlannerAction:
        """
        Determine the next action based on evaluation quality and coverage targets.
        """
        covered_topics = covered_topics or []
        covered_days = covered_days or []
        quality = evaluation.quality

        # Count unique topics/days covered so far
        unique_covered_count = max(len(set(covered_topics)), len(set(covered_days)))

        # Rule 1: Weak answer (0-3) -> Ask simpler clarification, stay on current topic
        if quality == QUALITY_WEAK:
            return PlannerAction(
                action_type=ACTION_CLARIFY,
                target_topic=current_topic,
                target_day=current_day,
                difficulty_delta=-1,
                reasoning=f"Candidate gave a weak answer (score {evaluation.score}). Stay on '{current_topic}' with a simpler clarification question."
            )

        # Rule 2: Moderate answer (4-6) -> Ask moderate follow-up or continue topic
        if quality == QUALITY_MODERATE:
            # If we've asked 2+ questions on this topic and need more topics, shift topic
            if questions_on_current_topic >= 2 and unique_covered_count < required_unique_units:
                next_topic, next_day = self._select_next_uncovered(covered_topics, covered_days)
                return PlannerAction(
                    action_type=ACTION_NEW_TOPIC,
                    target_topic=next_topic,
                    target_day=next_day,
                    difficulty_delta=0,
                    reasoning=f"Moderate answer on '{current_topic}'. Moving to new topic '{next_topic}' to expand curriculum coverage."
                )

            return PlannerAction(
                action_type=ACTION_MODERATE,
                target_topic=current_topic,
                target_day=current_day,
                difficulty_delta=0,
                reasoning=f"Candidate gave a moderate answer (score {evaluation.score}). Asking moderate follow-up on '{current_topic}'."
            )

        # Rule 3: Strong (7-8) or Excellent (9-10) -> Harder follow-up OR new topic
        if quality in (QUALITY_STRONG, QUALITY_EXCELLENT):
            # If we haven't reached the required 4 unique topics/days, prioritize moving to new topic after 1-2 strong turns
            if questions_on_current_topic >= 2 or (unique_covered_count < required_unique_units and total_questions >= 3):
                next_topic, next_day = self._select_next_uncovered(covered_topics, covered_days)
                if next_topic and next_topic != current_topic:
                    return PlannerAction(
                        action_type=ACTION_NEW_TOPIC,
                        target_topic=next_topic,
                        target_day=next_day,
                        difficulty_delta=+1,
                        reasoning=f"Strong answer (score {evaluation.score}). Transitioning to new topic '{next_topic}' to satisfy curriculum coverage."
                    )

            # Otherwise escalate difficulty on current topic
            return PlannerAction(
                action_type=ACTION_HARDER,
                target_topic=current_topic,
                target_day=current_day,
                difficulty_delta=+1,
                reasoning=f"Strong answer (score {evaluation.score}). Increasing difficulty on '{current_topic}' with a deeper architectural follow-up."
            )

        # Fallback default
        return PlannerAction(
            action_type=ACTION_MODERATE,
            target_topic=current_topic,
            target_day=current_day,
            difficulty_delta=0,
            reasoning="Default moderate progression."
        )

    def _select_next_uncovered(
        self,
        covered_topics: List[str],
        covered_days: List[str]
    ) -> tuple:
        """Select next uncovered topic and day from available sets."""
        uncovered_topics = [t for t in self.available_topics if t not in covered_topics]
        uncovered_days = [d for d in self.available_days if d not in covered_days]

        next_topic = uncovered_topics[0] if uncovered_topics else self.available_topics[0]
        next_day = uncovered_days[0] if uncovered_days else self.available_days[0]

        return next_topic, next_day
