"""
Independent Unit Tests for Person 1 AI Interview Agent & LLM Integration.
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
from backend.agent.interview_agent import InterviewAgent, MINIMUM_REQUIRED_QUESTIONS, MINIMUM_REQUIRED_UNIQUE_UNITS
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

    # 3. Test Hard Interview Completion Rule (Phase 6 Requirement)
    def test_completion_rule_7_questions_4_topics_is_not_complete(self):
        """7 questions + 4 topics -> NOT COMPLETE (question_count < 8)."""
        agent = InterviewAgent()
        agent.state.question_count = 7
        agent.state.covered_topics = ["Topic A", "Topic B", "Topic C", "Topic D"]
        agent.state.covered_days = ["Day 1", "Day 2", "Day 3", "Day 4"]

        self.assertFalse(agent.should_end(), "7 questions should NOT be complete even with 4 topics.")

    def test_completion_rule_8_questions_3_topics_is_not_complete(self):
        """8 questions + 3 topics -> NOT COMPLETE (unique covered < 4)."""
        agent = InterviewAgent()
        agent.state.question_count = 8
        agent.state.covered_topics = ["Topic A", "Topic B", "Topic C"]
        agent.state.covered_days = ["Day 1", "Day 2", "Day 3"]

        self.assertFalse(agent.should_end(), "8 questions should NOT be complete with only 3 topics.")

    def test_completion_rule_8_questions_4_topics_is_complete(self):
        """8 questions + 4 topics -> COMPLETE (both conditions satisfied)."""
        agent = InterviewAgent()
        agent.state.question_count = 8
        agent.state.covered_topics = ["Topic A", "Topic B", "Topic C", "Topic D"]
        agent.state.covered_days = ["Day 1", "Day 2", "Day 3", "Day 4"]

        self.assertTrue(agent.should_end(), "8 questions AND 4 topics MUST be complete.")

    def test_duplicate_topic_day_counting(self):
        """Duplicate topic/day entries should NOT increase unique count."""
        state = InterviewState()
        state.covered_topics = ["System Design", "System Design", "System Design"]
        state.covered_days = ["Day 1", "Day 1", "Day 1"]

        self.assertEqual(state.get_unique_topics_count(), 1)
        self.assertEqual(state.get_unique_days_count(), 1)
        self.assertEqual(state.get_unique_covered_count(), 1)

    # 4. Test State Model Updates & History Preservation
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

    # 5. Test Final Feedback Schema (Phase 8 & 9)
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

        # Schema keys check
        required_keys = {"summary", "strengths", "gaps", "next"}
        self.assertEqual(set(feedback.keys()), required_keys)
        self.assertIsInstance(feedback["summary"], str)
        self.assertIsInstance(feedback["strengths"], list)
        self.assertIsInstance(feedback["gaps"], list)
        self.assertIsInstance(feedback["next"], list)

    # ==================== TASK 2 SPECIFIC LLM TESTS ====================

    def test_mock_llm_question_generation(self):
        """Verify InterviewAgent uses MockLLMClient for question generation."""
        agent = InterviewAgent(llm_client=self.mock_llm)
        res = agent.start_interview()

        self.assertEqual(res["question"], "How do you architect a zero-downtime microservice migration?")
        self.assertGreater(len(self.mock_llm.call_history), 0)

    def test_strong_answer_harder_instruction(self):
        """Verify strong answer evaluation directs planner to HARDER action."""
        mock_eval = MockLLMClient(default_json={"score": 9.0, "quality": "excellent", "strengths": ["Clear design"], "gaps": [], "reasoning": "Great"})
        agent = InterviewAgent(llm_client=mock_eval)
        agent.start_interview()
        res = agent.process_answer("Used Redis and Kafka for async decoupling.")

        self.assertEqual(res["action"], ACTION_HARDER)
        self.assertEqual(res["evaluation"]["score"], 9.0)

    def test_weak_answer_clarification_instruction(self):
        """Verify weak answer evaluation directs planner to CLARIFY action."""
        mock_eval = MockLLMClient(default_json={"score": 2.0, "quality": "weak", "strengths": [], "gaps": ["No detail"], "reasoning": "Blank"})
        agent = InterviewAgent(llm_client=mock_eval)
        agent.start_interview()
        res = agent.process_answer("idk")

        self.assertEqual(res["action"], ACTION_CLARIFY)

    def test_moderate_answer_moderate_instruction(self):
        """Verify moderate answer evaluation directs planner to MODERATE action."""
        mock_eval = MockLLMClient(default_json={"score": 5.0, "quality": "moderate", "strengths": ["Basic attempt"], "gaps": ["Lacks edge cases"], "reasoning": "Okay"})
        agent = InterviewAgent(llm_client=mock_eval)
        agent.start_interview()
        res = agent.process_answer("Used basic SQL queries.")

        self.assertEqual(res["action"], ACTION_MODERATE)

    def test_conversation_history_reaches_llm(self):
        """Verify prompt generated for LLM includes conversation history."""
        agent = InterviewAgent(llm_client=self.mock_llm)
        agent.start_interview()
        agent.process_answer("First answer attempt")
        
        # Check call history for prompt text containing conversation history
        last_call = self.mock_llm.call_history[-1]
        self.assertIn("First answer attempt", last_call["prompt"])

    def test_candidate_info_reaches_llm(self):
        """Verify candidate information is passed into LLM prompt."""
        candidate_info = {"name": "Alex Tech", "role": "Senior Staff Engineer"}
        agent = InterviewAgent(llm_client=self.mock_llm)
        agent.start_interview(candidate_info=candidate_info)

        first_call = self.mock_llm.call_history[0]
        self.assertIn("Alex Tech", first_call["prompt"])

    def test_curriculum_context_injection(self):
        """Verify curriculum context is injected into LLM evaluation and question generation."""
        mock_retriever = lambda query: "Custom Curriculum Context: RAG Vector Search Result"
        agent = InterviewAgent(llm_client=self.mock_llm, curriculum_retriever=mock_retriever)
        agent.start_interview()
        agent.process_answer("Answer using curriculum")

        # Verify curriculum context appeared in prompt
        eval_prompt_call = [c for c in self.mock_llm.call_history if c["type"] == "generate_json"][0]
        self.assertIn("Custom Curriculum Context", eval_prompt_call["prompt"])

    def test_evaluator_structured_output_parsing(self):
        """Verify structured JSON output from LLM is correctly parsed into AnswerEvaluation."""
        eval_result = evaluate_answer_with_llm(
            self.mock_llm,
            question="Explain database indexing",
            answer="Using B-Trees and composite indexes."
        )

        self.assertEqual(eval_result.score, 8.0)
        self.assertEqual(eval_result.quality, "strong")
        self.assertEqual(eval_result.strengths, ["Solid technical grasp"])

    def test_malformed_llm_output_handling(self):
        """Verify parsing handles malformed or non-JSON output safely."""
        bad_llm = MockLLMClient(default_response="Not a valid JSON string")
        with self.assertRaises(ValueError):
            evaluate_answer_with_llm(bad_llm, "Question", "Answer")

    def test_feedback_schema_valid_with_llm(self):
        """Verify feedback generated using MockLLMClient matches required JSON schema."""
        mock_feedback_llm = MockLLMClient(
            default_json={
                "summary": "Candidate demonstrated strong skills.",
                "strengths": ["Architecture design"],
                "gaps": ["Error handling"],
                "next": ["Deep dive on distributed locks"]
            }
        )
        agent = InterviewAgent(llm_client=mock_feedback_llm)
        agent.start_interview()
        agent.process_answer("My answer")
        feedback = agent.generate_feedback()

        self.assertEqual(set(feedback.keys()), {"summary", "strengths", "gaps", "next"})
        self.assertEqual(feedback["summary"], "Candidate demonstrated strong skills.")


if __name__ == "__main__":
    unittest.main()
