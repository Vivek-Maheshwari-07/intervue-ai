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

TECHNICAL_KEYWORDS = [
    "redis", "memcached", "cache", "caching",
    "postgresql", "postgres", "mysql", "sql", "database", "nosql", "mongodb", "dynamodb",
    "kafka", "rabbitmq", "queue", "pubsub",
    "docker", "kubernetes", "k8s", "container",
    "rag", "chromadb", "embeddings", "vector", "langgraph", "ollama", "llm", "prompt",
    "graphql", "rest", "grpc", "protobuf", "http/2",
    "lru", "hash map", "b-tree", "indexing", "partitioning", "sharding",
    "raft", "paxos", "consensus", "replication", "failover",
    "prometheus", "jaeger", "grafana", "metrics", "tracing", "observability", "ci/cd"
]


def extract_key_concepts(text: str) -> List[str]:
    """Extract key technical concepts from candidate answer text."""
    if not text:
        return []
    words = text.lower()
    found = []
    for kw in TECHNICAL_KEYWORDS:
        if kw in words and kw not in found:
            found.append(kw)
    return found


def generate_answer_differentiated_fallback(
    action: PlannerAction,
    topic: str,
    day: str,
    previous_answer: str = "",
) -> str:
    """
    Generate deterministic, answer-differentiated fallback question based on
    candidate's actual previous answer and planner action when LLM is offline.
    """
    concepts = extract_key_concepts(previous_answer)
    concept_str = f"your points on {concepts[0]}" if concepts else f"your explanation in {topic}"

    if action.action_type == ACTION_HARDER:
        if concepts:
            return f"Building on {concept_str}, how would you architect this to handle 100x traffic spikes, data partitioning, and zero-downtime failover?"
        return f"Building on your solution in {topic}, how would you architect this to handle 100x traffic spikes, data partitioning, and zero-downtime failover?"

    if action.action_type == ACTION_CLARIFY:
        if concepts:
            return f"Let's step back to {concept_str}. Can you explain the core underlying mechanism and basic edge cases in simpler terms?"
        return f"Let's step back on {topic}. Can you explain the core underlying mechanism and basic edge cases in simpler terms?"

    if action.action_type == ACTION_MODERATE:
        if concepts:
            return f"Regarding {concept_str}, what are the specific performance, complexity, and memory consumption trade-offs in your approach?"
        return f"For {topic}, what are the key trade-offs between speed, complexity, and memory consumption in your approach?"

    if action.action_type == ACTION_NEW_TOPIC:
        if concepts:
            return f"Transitioning from {concept_str} to {topic}, how do you approach designing robust solutions for this domain in production?"
        return f"Let's now transition to {topic}. How do you approach designing robust solutions for this domain in production?"

    return f"How would you approach solving complex production problems in {topic}?"


def select_candidate_starting_topic(candidate_info: Optional[Dict[str, Any]]) -> tuple[str, str]:
    """
    Deterministically select starting topic and curriculum day based on candidate profile.
    """
    if not candidate_info or not isinstance(candidate_info, dict):
        return "Data Structures & Algorithmic Efficiency", "Day 1: Fundamentals & Code Quality"

    role = (candidate_info.get("jobRole") or "").lower()
    missions = candidate_info.get("missions", [])

    skipped_days = [m.get("day") for m in missions if isinstance(m, dict) and m.get("skipped")]

    if "data" in role or "analytics" in role:
        return "Database Design & Query Optimization", "Day 3: Databases & Caching"
    elif "ai" in role or "rag" in role or "machine learning" in role:
        return "System Architecture & Scaling", "Day 2: System Design & Microservices"
    elif skipped_days:
        return "API Design & Async Queues", "Day 4: Reliability & Distributed Systems"
    else:
        return "Data Structures & Algorithmic Efficiency", "Day 1: Fundamentals & Code Quality"


class InterviewAgent:
    """
    Main Interview Agent orchestrator for Person 1.
    Maintains clean decoupled interfaces for Person 2 (Curriculum RAG) and Person 3 (FastAPI/SQLite).
    """

    def __init__(
        self,
        state: Optional[InterviewState] = None,
        planner: Optional[QuestionPlanner] = None,
        curriculum_retriever: Optional[Callable[[str], Any]] = None,
        llm_generator_fn: Optional[Callable[[str], str]] = None,
        evaluator_fn: Optional[Callable[..., AnswerEvaluation]] = None,
        llm_client: Optional[Any] = None,
    ):
        self.state = state or InterviewState()
        self.planner = planner or QuestionPlanner()
        self.curriculum_retriever = curriculum_retriever
        self.llm_generator_fn = llm_generator_fn
        self.evaluator_fn = evaluator_fn
        self.llm_client = llm_client
        self.last_asked_question: Optional[str] = None
        self.questions_on_current_topic: int = 0

    def start_interview(
        self,
        candidate_info: Optional[Dict[str, Any]] = None,
        initial_topic: Optional[str] = None,
        initial_day: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initialize a new interview session with candidate personalization.
        """
        if candidate_info:
            self.state.candidate_info = candidate_info

        # Candidate personalization for starting topic
        if not initial_topic or not initial_day:
            sel_topic, sel_day = select_candidate_starting_topic(self.state.candidate_info)
            initial_topic = initial_topic or sel_topic
            initial_day = initial_day or sel_day

        self.state.current_topic = initial_topic
        self.state.current_day = initial_day
        self.state.covered_topics = [initial_topic]
        self.state.covered_days = [initial_day]
        self.state.status = STATUS_IN_PROGRESS
        self.questions_on_current_topic = 1

        # Fetch initial curriculum context
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

        # 1. Retrieve relevant curriculum context & day metadata
        curriculum_context = custom_curriculum_context or self.get_curriculum_context(topic)

        # 2. Evaluate candidate answer
        evaluation = evaluate_answer(
            question=question_asked,
            answer=answer,
            curriculum_context=curriculum_context,
            evaluator_fn=self.evaluator_fn,
            llm_client=self.llm_client
        )

        # 3. Plan next action using adaptive policy engine
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

        # 4. Record turn in State model
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

        # 5. HARD INTERVIEW COMPLETION CHECK
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

        # 6. Generate next question if not complete (passing candidate's previous answer for fallback)
        next_context = self.get_curriculum_context(self.state.current_topic or topic)
        next_question = self.generate_question(action, next_context, previous_answer=answer)
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
        HARD INTERVIEW COMPLETION RULE (Step 2):
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
        curriculum_context: Optional[str] = None,
        previous_answer: str = "",
    ) -> str:
        """
        Generate next interview question based on planner action, curriculum context, and previous answer.
        Uses llm_client if attached, or llm_generator_fn, or dynamic answer-differentiated fallback.
        """
        topic = action.target_topic or self.state.current_topic or "System Architecture"
        day = action.target_day or self.state.current_day or "Day 1"

        strict_system_prompt = (
            "You are a technical interviewer. "
            "Ask exactly ONE question. "
            "Do not explain your reasoning. "
            "Do not provide multiple alternatives. "
            "Do not provide the answer. "
            "Return only the interview question."
        )

        prompt = QUESTION_GENERATION_PROMPT.format(
            candidate_info=self.state.candidate_info,
            topic=topic,
            day=day,
            action_type=action.action_type,
            action_reasoning=action.reasoning,
            difficulty_delta=action.difficulty_delta,
            curriculum_context=curriculum_context or "Standard technical curriculum context.",
            conversation_history=self.state.conversation_history[-3:]
        )

        if self.llm_client is not None:
            try:
                generated = self.llm_client.generate(prompt, system_prompt=strict_system_prompt)
                if generated and len(generated.strip()) > 10:
                    return generated.strip()
            except Exception:
                pass

        if self.llm_generator_fn is not None:
            try:
                generated = self.llm_generator_fn(prompt)
                if generated and len(generated.strip()) > 10:
                    return generated.strip()
            except Exception:
                pass

        # Dynamic answer-differentiated fallback when LLM is offline
        return generate_answer_differentiated_fallback(
            action=action,
            topic=topic,
            day=day,
            previous_answer=previous_answer,
        )

    def get_curriculum_context(self, query: str) -> str:
        """
        Fetch curriculum context using retriever and record retrieved day metadata into state.covered_days.
        """
        if self.curriculum_retriever:
            try:
                res = self.curriculum_retriever(query)
                if isinstance(res, dict):
                    day_meta = res.get("day")
                    if day_meta and day_meta not in self.state.covered_days:
                        self.state.covered_days.append(day_meta)
                    return res.get("text", str(res))
                return str(res)
            except Exception:
                pass
        return f"Standard curriculum context reference for: {query}"

    def generate_feedback(self) -> Dict[str, Any]:
        """
        Synthesize final feedback matching required schema.
        """
        return generate_final_feedback(
            self.state,
            llm_generator_fn=self.llm_generator_fn,
            llm_client=self.llm_client
        )
