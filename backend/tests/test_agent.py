"""
Independent Unit Tests for AI Interview Agent & LLM Integration.
Runs completely offline without React, FastAPI, ChromaDB, external keys, or network access.
"""

import unittest
from backend.agent.state import InterviewState
from backend.agent.evaluator import (
    evaluate_answer, AnswerEvaluation, evaluate_answer_with_llm,
    QUALITY_WEAK, QUALITY_MODERATE, QUALITY_STRONG, QUALITY_EXCELLENT
)
from backend.agent.question_planner import (
    QuestionPlanner,
    ACTION_HARDER, ACTION_CLARIFY, ACTION_MODERATE, ACTION_NEW_TOPIC
)
from backend.agent.interview_agent import (
    InterviewAgent,
    MINIMUM_REQUIRED_QUESTIONS,
    MINIMUM_REQUIRED_UNIQUE_UNITS,
    extract_key_concepts,
    generate_answer_differentiated_fallback,
    select_candidate_starting_topic
)
from backend.agent.feedback import generate_final_feedback
from backend.agent.llm_client import MockLLMClient, OllamaLLMClient, OllamaConnectionError


class TestInterviewAgentFoundation(unittest.TestCase):

    def setUp(self):
        self.state = InterviewState(session_id="test_session")
        self.planner = QuestionPlanner()
        self.mock_llm = MockLLMClient(
            default_response="How do you architect a zero-downtime microservice migration?",
            default_json={
                "score": 8.0,
                "quality": "strong",
                "strengths": ["Solid technical grasp"],
                "gaps": ["Could mention edge case recovery"],
                "reasoning": "Good architectural explanation."
            }
        )

    # 1. Test Evaluator Quality Mapping & Deterministic Scoring
    def test_strong_answer_evaluator(self):
        """Test strong answer scoring and quality mapping (score 7-8 -> strong/excellent)."""
        strong_answer = "We can use an LRU Cache with an O(1) doubly linked list and Hash Map to manage cache eviction and scale throughput under concurrency."
        evaluation = evaluate_answer("How do you design an LRU cache?", strong_answer)
        
        self.assertGreaterEqual(evaluation.score, 7.0)
        self.assertIn(evaluation.quality, [QUALITY_STRONG, QUALITY_EXCELLENT])
        self.assertGreater(len(evaluation.strengths), 0)

    def test_weak_answer_evaluator(self):
        """Test weak answer scoring and quality mapping (score 0-3 -> weak)."""
        weak_answer = "idk maybe use a loop or something"
        evaluation = evaluate_answer("Explain database locking", weak_answer)

        self.assertLessEqual(evaluation.score, 3.5)
        self.assertEqual(evaluation.quality, QUALITY_WEAK)
        self.assertGreater(len(evaluation.gaps), 0)

    def test_moderate_answer_evaluator(self):
        """Test moderate answer scoring and quality mapping (score 4-6 -> moderate)."""
        moderate_answer = "We can store data in a database table and read it when needed."
        evaluation = evaluate_answer("How to store audit logs?", moderate_answer)

        self.assertGreaterEqual(evaluation.score, 4.0)
        self.assertLessEqual(evaluation.score, 6.5)
        self.assertEqual(evaluation.quality, QUALITY_MODERATE)

    # 2. Test Question Planner Actions
    def test_planner_weak_answer_triggers_clarify(self):
        """Weak answer (score 2) -> CLARIFY action on same topic."""
        eval_result = AnswerEvaluation(score=2.0, quality=QUALITY_WEAK, gaps=["Lacks depth"])
        action = self.planner.plan_next_action(
            evaluation=eval_result,
            current_topic="Databases",
            current_day="Day 1"
        )
        self.assertEqual(action.action_type, ACTION_CLARIFY)
        self.assertEqual(action.target_topic, "Databases")
        self.assertEqual(action.difficulty_delta, -1)

    def test_planner_moderate_answer_triggers_moderate(self):
        """Moderate answer (score 5) -> MODERATE action."""
        eval_result = AnswerEvaluation(score=5.0, quality=QUALITY_MODERATE)
        action = self.planner.plan_next_action(
            evaluation=eval_result,
            current_topic="System Design",
            current_day="Day 2",
            questions_on_current_topic=1
        )
        self.assertEqual(action.action_type, ACTION_MODERATE)

    def test_planner_strong_answer_triggers_harder(self):
        """Strong answer (score 8) on single turn -> HARDER escalation action."""
        eval_result = AnswerEvaluation(score=8.0, quality=QUALITY_STRONG)
        action = self.planner.plan_next_action(
            evaluation=eval_result,
            current_topic="Distributed Systems",
            current_day="Day 3",
            covered_topics=["Distributed Systems"],
            questions_on_current_topic=1
        )
        self.assertEqual(action.action_type, ACTION_HARDER)
        self.assertEqual(action.difficulty_delta, +1)

    # 3. Test Hard Interview Completion Rule (Phase 6 / Step 2 Requirement)
    def test_completion_rule_7_questions_4_topics_is_not_complete(self):
        """7 questions + 4 days -> NOT COMPLETE (question_count < 8)."""
        agent = InterviewAgent()
        agent.state.question_count = 7
        agent.state.covered_topics = ["Topic A", "Topic B", "Topic C", "Topic D"]
        agent.state.covered_days = ["Day 1", "Day 2", "Day 3", "Day 4"]

        self.assertFalse(agent.should_end(), "7 questions should NOT be complete even with 4 days.")

    def test_completion_rule_8_questions_3_days_is_not_complete(self):
        """8 questions + 3 unique days -> NOT COMPLETE (unique covered < 4)."""
        agent = InterviewAgent()
        agent.state.question_count = 8
        agent.state.covered_topics = ["Topic A", "Topic B", "Topic C"]
        agent.state.covered_days = ["Day 1", "Day 2", "Day 3"]

        self.assertFalse(agent.should_end(), "8 questions should NOT be complete with only 3 days.")

    def test_completion_rule_8_questions_4_days_is_complete(self):
        """8 questions + 4 unique days -> COMPLETE (both conditions satisfied)."""
        agent = InterviewAgent()
        agent.state.question_count = 8
        agent.state.covered_topics = ["Topic A", "Topic B", "Topic C", "Topic D"]
        agent.state.covered_days = ["Day 1", "Day 2", "Day 3", "Day 4"]

        self.assertTrue(agent.should_end(), "8 questions AND 4 unique days MUST be complete.")

    def test_duplicate_topic_day_counting(self):
        """Duplicate topic/day entries should NOT increase unique count."""
        state = InterviewState()
        state.covered_topics = ["System Design", "System Design", "System Design"]
        state.covered_days = ["Day 1", "Day 1", "Day 1"]

        self.assertEqual(state.get_unique_topics_count(), 1)
        self.assertEqual(state.get_unique_days_count(), 1)
        self.assertEqual(state.get_unique_covered_count(), 1)

    # 4. Test Dynamic Answer-Differentiated Fallback (Step 2 Requirement)
    def test_extracted_concepts_from_answer(self):
        """Verify technical concepts are extracted from candidate answers."""
        concepts_redis = extract_key_concepts("I would use Redis caching and LRU eviction.")
        self.assertIn("redis", concepts_redis)
        self.assertIn("lru", concepts_redis)

        concepts_postgres = extract_key_concepts("We partitioned PostgreSQL using B-Tree indexing.")
        self.assertIn("postgresql", concepts_postgres)
        self.assertIn("indexing", concepts_postgres)

    def test_answer_differentiated_fallback_questions(self):
        """Verify different candidate answers produce different fallback questions."""
        from backend.agent.question_planner import PlannerAction, ACTION_HARDER
        action = PlannerAction(action_type=ACTION_HARDER)

        ans_a = "I used Redis caching with TTL eviction."
        ans_b = "I used PostgreSQL database partitioning by customer ID."

        q_a = generate_answer_differentiated_fallback(action, "Architecture", "Day 2", ans_a)
        q_b = generate_answer_differentiated_fallback(action, "Architecture", "Day 2", ans_b)

        self.assertNotEqual(q_a, q_b, "Different candidate answers MUST yield different fallback questions!")
        self.assertIn("redis", q_a.lower())
        self.assertIn("postgresql", q_b.lower())

    # 5. Test Candidate Personalization (Step 2 Requirement)
    def test_candidate_starting_topic_personalization(self):
        """Verify candidate profile influences starting topic selection."""
        cand_data_engineer = {"jobRole": "Senior Data Engineer", "missions": []}
        topic_de, day_de = select_candidate_starting_topic(cand_data_engineer)
        self.assertEqual(topic_de, "Database Design & Query Optimization")

        cand_ai_engineer = {"jobRole": "AI Research Engineer", "missions": []}
        topic_ai, day_ai = select_candidate_starting_topic(cand_ai_engineer)
        self.assertEqual(topic_ai, "System Architecture & Scaling")

    # 6. Test State Model Updates & History Preservation
    def test_state_updates_and_turn_recording(self):
        """Verify question_count increments, conversation history is preserved, and scores stored."""
        state = InterviewState()
        turn1 = state.add_turn(
            question="What is microservice failover?",
            answer="Using circuit breakers and fallback instances.",
            topic="Microservices",
            day="Day 2",
            score=8.5,
            quality=QUALITY_STRONG,
            action=ACTION_HARDER
        )

        self.assertEqual(state.question_count, 1)
        self.assertEqual(len(state.conversation_history), 1)
        self.assertEqual(state.scores, [8.5])
        self.assertEqual(state.covered_topics, ["Microservices"])
        self.assertEqual(state.get_average_score(), 8.5)

        # Test state dict serialization / deserialization
        state_dict = state.to_dict()
        reconstructed = InterviewState.from_dict(state_dict)
        self.assertEqual(reconstructed.question_count, 1)
        self.assertEqual(reconstructed.scores, [8.5])

    # 7. Test Final Feedback Schema
    def test_final_feedback_schema(self):
        """Verify final feedback dictionary matches exact required JSON schema."""
        state = InterviewState()
        state.add_turn(
            question="Explain Redis caching",
            answer="Using Redis in front of DB with TTL eviction.",
            topic="Caching",
            day="Day 3",
            score=8.0,
            quality=QUALITY_STRONG
        )

        feedback = generate_final_feedback(state)

        required_keys = {"summary", "strengths", "gaps", "next"}
        self.assertEqual(set(feedback.keys()), required_keys)
        self.assertIsInstance(feedback["summary"], str)
        self.assertIsInstance(feedback["strengths"], list)
        self.assertIsInstance(feedback["gaps"], list)
        self.assertIsInstance(feedback["next"], list)


if __name__ == "__main__":
    unittest.main()
