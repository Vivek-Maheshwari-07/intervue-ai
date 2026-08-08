"""
Main Interview Agent Controller
Orchestrates interview workflow: State Management -> Answer Evaluation -> Adaptive Planning ->
Question Generation -> Hard Completion Enforcement -> Final Feedback Synthesis.
"""

from typing import Dict, Any, Optional, List, Callable
from .state import InterviewState, STATUS_COMPLETED, STATUS_IN_PROGRESS
from .evaluator import evaluate_answer, AnswerEvaluation, map_score_to_quality
from .question_planner import QuestionPlanner, PlannerAction, ACTION_HARDER, ACTION_CLARIFY, ACTION_MODERATE, ACTION_NEW_TOPIC
from .feedback import generate_final_feedback
from .prompts import SYSTEM_INTERVIEWER_PROMPT, QUESTION_GENERATION_PROMPT

# Mandatory Hackathon Completion Thresholds
MINIMUM_REQUIRED_QUESTIONS = 8
MINIMUM_REQUIRED_UNIQUE_UNITS = 4  # 4 unique curriculum days or topics


class InterviewAgent:
    """
    Main Interview Agent orchestrator for Person 1.
    Maintains clean decoupled interfaces for Person 2 (Curriculum RAG) and Person 3 (FastAPI/SQLite).
    """

    def __init__(
        self,
        state: Optional[InterviewState] = None,
        planner: Optional[QuestionPlanner] = None,
        curriculum_retriever: Optional[Callable[[str], str]] = None,
        llm_generator_fn: Optional[Callable[[str], str]] = None,
        evaluator_fn: Optional[Callable[..., AnswerEvaluation]] = None,
    ):
        self.state = state or InterviewState()
        self.planner = planner or QuestionPlanner()
        self.curriculum_retriever = curriculum_retriever
        self.llm_generator_fn = llm_generator_fn
        self.evaluator_fn = evaluator_fn
        self.last_asked_question: Optional[str] = None
        self.questions_on_current_topic: int = 0

    def start_interview(
        self,
        candidate_info: Optional[Dict[str, Any]] = None,
        initial_topic: str = "Data Structures & Algorithmic Efficiency",
        initial_day: str = "Day 1: Fundamentals & Code Quality"
    ) -> Dict[str, Any]:
        """
        Initialize a new interview session and return the first question.
        """
        if candidate_info:
            self.state.candidate_info = candidate_info

        self.state.current_topic = initial_topic
        self.state.current_day = initial_day
        self.state.covered_topics = [initial_topic]
        self.state.covered_days = [initial_day]
        self.state.status = STATUS_IN_PROGRESS
        self.questions_on_current_topic = 1

        # Fetch initial curriculum context from Person 2's retriever if connected
        curriculum_context = self.get_curriculum_context(initial_topic)

        # Generate initial opening question
        first_action = PlannerAction(
            action_type=ACTION_NEW_TOPIC,
            target_topic=initial_topic,
            target_day=initial_day,
            difficulty_delta=0,
            reasoning="Opening question of the technical interview."
        )

        first_question = self.generate_question(first_action, curriculum_context)
        self.last_asked_question = first_question

        return {
            "session_id": self.state.session_id,
            "status": self.state.status,
            "question": first_question,
            "topic": initial_topic,
            "day": initial_day,
            "question_count": 1,
            "covered_days_count": self.state.get_unique_days_count(),
            "covered_topics_count": self.state.get_unique_topics_count(),
            "is_complete": False,
        }

    def process_answer(
        self,
        answer: str,
        custom_curriculum_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process the candidate's answer through Evaluation -> State Update -> Adaptive Planning ->
        Completion Check -> Next Question / Final Feedback.
        """
        if self.state.is_completed():
            return {
                "error": "Interview session is already completed.",
                "is_complete": True,
                "feedback": self.generate_feedback()
            }

        question_asked = self.last_asked_question or "Technical question"
        topic = self.state.current_topic or "General Technical"
        day = self.state.current_day or "Day 1"

        # 1. Retrieve relevant curriculum context (Person 2 pluggable interface)
        curriculum_context = custom_curriculum_context or self.get_curriculum_context(topic)

        # 2. Evaluate candidate answer (Phase 4)
        evaluation = evaluate_answer(
            question=question_asked,
            answer=answer,
            curriculum_context=curriculum_context,
            evaluator_fn=self.evaluator_fn
        )

        # 3. Plan next action using adaptive policy engine (Phase 5)
        action = self.planner.plan_next_action(
            evaluation=evaluation,
            current_topic=topic,
            current_day=day,
            covered_topics=self.state.covered_topics,
            covered_days=self.state.covered_days,
            questions_on_current_topic=self.questions_on_current_topic,
            total_questions=self.state.question_count,
            required_unique_units=MINIMUM_REQUIRED_UNIQUE_UNITS
        )

        # 4. Record turn in State model (Phase 3)
        turn = self.state.add_turn(
            question=question_asked,
            answer=answer,
            topic=topic,
            day=day,
            score=evaluation.score,
            quality=evaluation.quality,
            action=action.action_type,
            evaluation_details=evaluation.to_dict()
        )

        # Update current topic/day state if action moves to NEW_TOPIC
        if action.action_type == ACTION_NEW_TOPIC and action.target_topic:
            self.state.current_topic = action.target_topic
            self.state.current_day = action.target_day or self.state.current_day
            if action.target_topic not in self.state.covered_topics:
                self.state.covered_topics.append(action.target_topic)
            if action.target_day and action.target_day not in self.state.covered_days:
                self.state.covered_days.append(action.target_day)
            self.questions_on_current_topic = 1
        else:
            self.questions_on_current_topic += 1

        # 5. HARD INTERVIEW COMPLETION CHECK (Phase 6)
        if self.should_end():
            self.state.mark_completed()
            final_feedback = self.generate_feedback()
            return {
                "session_id": self.state.session_id,
                "status": STATUS_COMPLETED,
                "is_complete": True,
                "evaluation": evaluation.to_dict(),
                "action": action.action_type,
                "question_count": self.state.question_count,
                "unique_covered_count": self.state.get_unique_covered_count(),
                "feedback": final_feedback,
            }

        # 6. Generate next question if not complete
        next_context = self.get_curriculum_context(self.state.current_topic or topic)
        next_question = self.generate_question(action, next_context)
        self.last_asked_question = next_question

        return {
            "session_id": self.state.session_id,
            "status": STATUS_IN_PROGRESS,
            "is_complete": False,
            "evaluation": evaluation.to_dict(),
            "action": action.action_type,
            "next_question": next_question,
            "topic": self.state.current_topic,
            "day": self.state.current_day,
            "question_count": self.state.question_count,
            "covered_days_count": self.state.get_unique_days_count(),
            "covered_topics_count": self.state.get_unique_topics_count(),
            "unique_covered_count": self.state.get_unique_covered_count(),
        }

    def should_end(self) -> bool:
        """
        HARD INTERVIEW COMPLETION RULE (Phase 6):
        Interview completes ONLY when:
        1. question_count >= 8 (MINIMUM_REQUIRED_QUESTIONS)
        AND
        2. unique covered curriculum days/topics >= 4 (MINIMUM_REQUIRED_UNIQUE_UNITS)

        Returns True ONLY when BOTH conditions are satisfied.
        """
        has_min_questions = self.state.question_count >= MINIMUM_REQUIRED_QUESTIONS
        has_min_coverage = self.state.get_unique_covered_count() >= MINIMUM_REQUIRED_UNIQUE_UNITS

        return has_min_questions and has_min_coverage

    def generate_question(
        self,
        action: PlannerAction,
        curriculum_context: Optional[str] = None
    ) -> str:
        """
        Generate next interview question based on planner action and curriculum context.
        Uses LLM generator if attached, or deterministic fallback templates.
        """
        topic = action.target_topic or self.state.current_topic or "System Architecture"

        if self.llm_generator_fn:
            try:
                prompt = QUESTION_GENERATION_PROMPT.format(
                    candidate_info=self.state.candidate_info,
                    topic=topic,
                    day=action.target_day or self.state.current_day,
                    action_type=action.action_type,
                    action_reasoning=action.reasoning,
                    difficulty_delta=action.difficulty_delta,
                    curriculum_context=curriculum_context or "Standard curriculum background.",
                    conversation_history=self.state.conversation_history[-3:]
                )
                generated = self.llm_generator_fn(prompt)
                if generated and len(generated.strip()) > 10:
                    return generated.strip()
            except Exception:
                pass

        # Deterministic offline question templates for robust fallback & testing
        templates = {
            ACTION_HARDER: f"Building on your solution in {topic}, how would you architect this to handle 100x traffic spikes, data partitioning, and zero-downtime failover?",
            ACTION_CLARIFY: f"Let's step back on {topic}. Can you explain the core underlying mechanism and basic edge cases in simpler terms?",
            ACTION_MODERATE: f"For {topic}, what are the key trade-offs between speed, complexity, and memory consumption in your approach?",
            ACTION_NEW_TOPIC: f"Let's now transition to {topic}. How do you approach designing robust solutions for this domain in production?",
        }

        return templates.get(action.action_type, f"How would you approach solving complex problems in {topic}?")

    def get_curriculum_context(self, query: str) -> str:
        """
        Fetch curriculum context using Person 2's retriever if available.
        """
        if self.curriculum_retriever:
            try:
                return self.curriculum_retriever(query)
            except Exception:
                pass
        return f"Standard curriculum context reference for: {query}"

    def generate_feedback(self) -> Dict[str, Any]:
        """
        Synthesize final feedback matching required schema (Phase 9).
        """
        return generate_final_feedback(self.state, self.llm_generator_fn)
