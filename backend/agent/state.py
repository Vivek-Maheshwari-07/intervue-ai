"""
Interview State Model
Tracks the complete conversation, question count, covered curriculum days/topics, scores, and status.
Designed for easy serialization/deserialization for SQLite persistence by Person 3.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional, Set

STATUS_IN_PROGRESS = "in_progress"
STATUS_COMPLETED = "completed"


@dataclass
class TurnRecord:
    """Represents a single question-answer turn in the interview."""
    turn_index: int
    question: str
    answer: str
    topic: Optional[str] = None
    day: Optional[str] = None
    score: Optional[float] = None
    quality: Optional[str] = None
    action: Optional[str] = None
    timestamp: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TurnRecord":
        return cls(**data)


@dataclass
class InterviewState:
    """
    State model for the interview session.
    Source of truth for question count, topic coverage, and completion checks.
    """
    session_id: str = "default_session"
    candidate_info: Dict[str, Any] = field(default_factory=dict)
    question_count: int = 0
    covered_days: List[str] = field(default_factory=list)
    covered_topics: List[str] = field(default_factory=list)
    conversation_history: List[Dict[str, Any]] = field(default_factory=list)
    scores: List[float] = field(default_factory=list)
    evaluations: List[Dict[str, Any]] = field(default_factory=list)
    current_topic: Optional[str] = None
    current_day: Optional[str] = None
    status: str = STATUS_IN_PROGRESS

    def add_turn(
        self,
        question: str,
        answer: str,
        topic: Optional[str] = None,
        day: Optional[str] = None,
        score: Optional[float] = None,
        quality: Optional[str] = None,
        action: Optional[str] = None,
        evaluation_details: Optional[Dict[str, Any]] = None,
    ) -> TurnRecord:
        """
        Record a question-answer turn, update state counters, topic lists, and scores.
        """
        self.question_count += 1

        if topic and topic not in self.covered_topics:
            self.covered_topics.append(topic)

        if day and day not in self.covered_days:
            self.covered_days.append(day)

        if topic:
            self.current_topic = topic
        if day:
            self.current_day = day

        if score is not None:
            self.scores.append(float(score))

        turn = TurnRecord(
            turn_index=self.question_count,
            question=question,
            answer=answer,
            topic=topic or self.current_topic,
            day=day or self.current_day,
            score=score,
            quality=quality,
            action=action,
        )

        turn_dict = turn.to_dict()
        self.conversation_history.append(turn_dict)

        if evaluation_details:
            self.evaluations.append(evaluation_details)

        return turn

    def get_unique_days_count(self) -> int:
        """Returns the number of unique curriculum days covered so far."""
        return len(set(self.covered_days))

    def get_unique_topics_count(self) -> int:
        """Returns the number of unique curriculum topics covered so far."""
        return len(set(self.covered_topics))

    def get_unique_covered_count(self) -> int:
        """
        Returns the count of unique covered units (maximum of unique days or unique topics).
        Ensures robust counting whether curriculum is structured by days or topics.
        """
        unique_days = set(d for d in self.covered_days if d)
        unique_topics = set(t for t in self.covered_topics if t)
        return max(len(unique_days), len(unique_topics))

    def get_average_score(self) -> float:
        """Returns average score so far (0.0 if no scores)."""
        if not self.scores:
            return 0.0
        return round(sum(self.scores) / len(self.scores), 2)

    def mark_completed(self) -> None:
        """Set interview status to completed."""
        self.status = STATUS_COMPLETED

    def is_completed(self) -> bool:
        """Check if state is marked completed."""
        return self.status == STATUS_COMPLETED

    def to_dict(self) -> Dict[str, Any]:
        """Serialize state to a dictionary for SQLite or JSON storage."""
        return {
            "session_id": self.session_id,
            "candidate_info": self.candidate_info,
            "question_count": self.question_count,
            "covered_days": self.covered_days,
            "covered_topics": self.covered_topics,
            "conversation_history": self.conversation_history,
            "scores": self.scores,
            "evaluations": self.evaluations,
            "current_topic": self.current_topic,
            "current_day": self.current_day,
            "status": self.status,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "InterviewState":
        """Reconstruct InterviewState from a dictionary."""
        return cls(
            session_id=data.get("session_id", "default_session"),
            candidate_info=data.get("candidate_info", {}),
            question_count=data.get("question_count", 0),
            covered_days=data.get("covered_days", []),
            covered_topics=data.get("covered_topics", []),
            conversation_history=data.get("conversation_history", []),
            scores=data.get("scores", []),
            evaluations=data.get("evaluations", []),
            current_topic=data.get("current_topic"),
            current_day=data.get("current_day"),
            status=data.get("status", STATUS_IN_PROGRESS),
        )
