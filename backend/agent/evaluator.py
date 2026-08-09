"""
Answer Evaluator Module
Evaluates technical answers on a 0-10 scale and maps scores to quality tiers.
Provides pluggable evaluation backend (LLM-backed via Qwen3/LLMClient or deterministic rule-based fallback).
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Callable
from .prompts import ANSWER_EVALUATION_PROMPT

# Configurable Quality Score Boundaries
SCORE_THRESHOLD_WEAK = 3.0      # 0 <= score <= 3 -> weak
SCORE_THRESHOLD_MODERATE = 6.0  # 4 <= score <= 6 -> moderate
SCORE_THRESHOLD_STRONG = 8.0    # 7 <= score <= 8 -> strong
                                # 9 <= score <= 10 -> excellent

QUALITY_WEAK = "weak"
QUALITY_MODERATE = "moderate"
QUALITY_STRONG = "strong"
QUALITY_EXCELLENT = "excellent"


def map_score_to_quality(score: float) -> str:
    """
    Map numerical score (0-10) to qualitative performance rating.
    """
    if score <= SCORE_THRESHOLD_WEAK:
        return QUALITY_WEAK
    elif score <= SCORE_THRESHOLD_MODERATE:
        return QUALITY_MODERATE
    elif score <= SCORE_THRESHOLD_STRONG:
        return QUALITY_STRONG
    else:
        return QUALITY_EXCELLENT


@dataclass
class AnswerEvaluation:
    """Structured evaluation result for a candidate answer."""
    score: float
    quality: str
    strengths: List[str] = field(default_factory=list)
    gaps: List[str] = field(default_factory=list)
    reasoning: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "score": self.score,
            "quality": self.quality,
            "strengths": self.strengths,
            "gaps": self.gaps,
            "reasoning": self.reasoning,
        }


def evaluate_answer_with_llm(
    llm_client: Any,
    question: str,
    answer: str,
    curriculum_context: Optional[str] = None
) -> AnswerEvaluation:
    """
    Evaluate candidate answer using Qwen3/LLMClient structured output.
    Safely parses score, quality, strengths, gaps, and reasoning.
    """
    prompt = ANSWER_EVALUATION_PROMPT.format(
        question=question,
        answer=answer if answer and answer.strip() else "[No answer provided]",
        curriculum_context=curriculum_context or "Standard technical curriculum context."
    )

    try:
        parsed_json = llm_client.generate_json(prompt)
        raw_score = float(parsed_json.get("score", 5.0))
        score = max(0.0, min(10.0, round(raw_score, 1)))

        quality = parsed_json.get("quality", "").lower()
        if quality not in (QUALITY_WEAK, QUALITY_MODERATE, QUALITY_STRONG, QUALITY_EXCELLENT):
            quality = map_score_to_quality(score)

        strengths = parsed_json.get("strengths", [])
        if not isinstance(strengths, list):
            strengths = [str(strengths)]

        gaps = parsed_json.get("gaps", [])
        if not isinstance(gaps, list):
            gaps = [str(gaps)]

        reasoning = str(parsed_json.get("reasoning", "LLM evaluation completed."))

        return AnswerEvaluation(
            score=score,
            quality=quality,
            strengths=[str(s) for s in strengths],
            gaps=[str(g) for g in gaps],
            reasoning=reasoning
        )
    except Exception as e:
        raise ValueError(f"LLM Answer Evaluation parsing failed: {e}")


def _deterministic_mock_evaluator(
    question: str,
    answer: str,
    curriculum_context: Optional[str] = None
) -> AnswerEvaluation:
    """
    Rule-based mock evaluator for independent offline testing and fallback when LLM is unavailable.
    Inspects answer length, key technical terminology, and edge case coverage.
    """
    if not answer or not answer.strip():
        return AnswerEvaluation(
            score=0.0,
            quality=QUALITY_WEAK,
            strengths=[],
            gaps=["No answer provided", "Blank response"],
            reasoning="Candidate submitted an empty answer."
        )

    words = answer.strip().split()
    word_count = len(words)
    answer_lower = answer.lower()

    # Rule-based scoring heuristic for testing
    score = 5.0
    strengths = []
    gaps = []

    # Check depth & length
    if word_count < 10:
        score -= 2.5
        gaps.append("Response is too brief and lacks detail.")
    elif word_count >= 25:
        score += 1.5
        strengths.append("Provides detailed explanation.")

    # Check technical indicators
    tech_keywords = [
        "architecture", "tradeoff", "latency", "scale", "cache", "async",
        "database", "index", "concurrency", "distributed", "lock", "queue",
        "failover", "idempotent", "complexity", "o(1)", "o(n)", "api", "schema"
    ]
    matched_keywords = [kw for kw in tech_keywords if kw in answer_lower]

    if matched_keywords:
        score += min(3.0, len(matched_keywords) * 0.8)
        strengths.append(f"Used technical terms: {', '.join(matched_keywords[:3])}")
    else:
        gaps.append("Lacks specific technical terms or concrete architectural concepts.")

    # Check for weakness indicators
    weak_indicators = ["idk", "don't know", "not sure", "maybe", "guess", "no idea"]
    if any(wi in answer_lower for wi in weak_indicators):
        score -= 2.0
        gaps.append("Exhibited uncertainty in answer.")

    # Clamp score to [0.0, 10.0]
    score = max(0.0, min(10.0, round(score, 1)))
    quality = map_score_to_quality(score)

    reasoning = (
        f"Evaluated response ({word_count} words). "
        f"Identified {len(strengths)} strength points and {len(gaps)} gap points. "
        f"Mapped score {score}/10 to quality level '{quality}'."
    )

    return AnswerEvaluation(
        score=score,
        quality=quality,
        strengths=strengths if strengths else ["Basic attempt provided"],
        gaps=gaps if gaps else ["Could provide deeper code example"],
        reasoning=reasoning,
    )


def evaluate_answer(
    question: str,
    answer: str,
    curriculum_context: Optional[str] = None,
    evaluator_fn: Optional[Callable[..., AnswerEvaluation]] = None,
    llm_client: Any = None,
) -> AnswerEvaluation:
    """
    Main evaluation entry point.
    Uses llm_client if provided, or custom evaluator_fn, otherwise falls back to deterministic evaluator.
    """
    if llm_client is not None:
        try:
            return evaluate_answer_with_llm(llm_client, question, answer, curriculum_context)
        except Exception:
            pass
    if evaluator_fn is not None:
        try:
            return evaluator_fn(question, answer, curriculum_context)
        except Exception:
            pass
    return _deterministic_mock_evaluator(question, answer, curriculum_context)
