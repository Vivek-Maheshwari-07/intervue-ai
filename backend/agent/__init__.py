"""
Interview Agent Package for Person 1 (AI / Agent Engineer).
Contains core interview state, answer evaluation, question planning, prompt templates,
feedback generation, and main agent orchestration.
"""

from .state import InterviewState
from .evaluator import evaluate_answer, AnswerEvaluation, QUALITY_WEAK, QUALITY_MODERATE, QUALITY_STRONG, QUALITY_EXCELLENT
from .question_planner import QuestionPlanner, PlannerAction, ACTION_HARDER, ACTION_CLARIFY, ACTION_MODERATE, ACTION_NEW_TOPIC
from .prompts import SYSTEM_INTERVIEWER_PROMPT, QUESTION_GENERATION_PROMPT, ANSWER_EVALUATION_PROMPT, FINAL_FEEDBACK_PROMPT
from .feedback import generate_final_feedback, FeedbackResult
from .llm_client import LLMClient, OllamaLLMClient, MockLLMClient, OllamaConnectionError
from .interview_agent import InterviewAgent

__all__ = [
    "InterviewState",
    "evaluate_answer",
    "AnswerEvaluation",
    "QUALITY_WEAK",
    "QUALITY_MODERATE",
    "QUALITY_STRONG",
    "QUALITY_EXCELLENT",
    "QuestionPlanner",
    "PlannerAction",
    "ACTION_HARDER",
    "ACTION_CLARIFY",
    "ACTION_MODERATE",
    "ACTION_NEW_TOPIC",
    "SYSTEM_INTERVIEWER_PROMPT",
    "QUESTION_GENERATION_PROMPT",
    "ANSWER_EVALUATION_PROMPT",
    "FINAL_FEEDBACK_PROMPT",
    "generate_final_feedback",
    "FeedbackResult",
    "LLMClient",
    "OllamaLLMClient",
    "MockLLMClient",
    "OllamaConnectionError",
    "InterviewAgent",
]
