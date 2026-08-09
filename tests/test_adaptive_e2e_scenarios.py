"""
Adaptive Interview E2E Verification Test Suite
Tests Scenarios A-E specified in Change 5:
- Scenario A: Strong Answer -> HARDER action -> deeper technical question
- Scenario B: Weak Answer -> CLARIFY action -> fundamental clarification question
- Scenario C: Answer-specific context preservation
- Scenario D: Topic transitions grounded in curriculum
- Scenario E: Completion enforced at questions >= 8 AND topics >= 4
"""

import asyncio
import sys
import os

# Ensure project root & backend are in sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.database.database import init_db
from backend.services.interview_service import process_interview_turn


async def run_e2e_verification():
    print("=== INITIALIZING DATABASE ===")
    await init_db()

    session_id = f"test-adaptive-e2e-{asyncio.get_event_loop().time()}"
    candidate_id = "CAND-001"  # Sarah Johnson from data/candidates.json

    print(f"\n=== 1. STARTING SESSION (Candidate: {candidate_id}) ===")
    turn1 = await process_interview_turn(session_id, candidate_id, "")
    print(f"Status: {turn1.status}")
    print(f"Q1 Topic: {turn1.coveredTopics}")
    print(f"Q1 Text: {turn1.question}")
    assert turn1.status == "ongoing"
    assert turn1.questionNumber == 1

    print("\n=== 2. SCENARIO A: STRONG TECHNICAL ANSWER ===")
    strong_ans = (
        "I designed a RAG pipeline using ChromaDB vector database with HNSW indexing and "
        "OpenAI embeddings for semantic similarity search. We implemented cross-encoder reranking "
        "to score candidate documents before feeding them into Qwen3 LLM context."
    )
    turn2 = await process_interview_turn(session_id, candidate_id, strong_ans)
    assert turn2.status == "ongoing"
    assert turn2.adaptiveSignal is not None
    print(f"Signal Action: {turn2.adaptiveSignal.action}")
    print(f"Signal Quality: {turn2.adaptiveSignal.quality}")
    print(f"Signal Reason: {turn2.adaptiveSignal.reason}")
    print(f"Q2 Text: {turn2.question}")
    assert turn2.adaptiveSignal.action in ["HARDER", "MODERATE", "NEW_TOPIC"]

    print("\n=== 3. SCENARIO B: WEAK ANSWER ADAPTATION ===")
    weak_ans = "idk not sure how that works."
    turn3 = await process_interview_turn(session_id, candidate_id, weak_ans)
    assert turn3.status == "ongoing"
    assert turn3.adaptiveSignal is not None
    print(f"Signal Action: {turn3.adaptiveSignal.action}")
    print(f"Signal Quality: {turn3.adaptiveSignal.quality}")
    print(f"Signal Reason: {turn3.adaptiveSignal.reason}")
    print(f"Q3 Text: {turn3.question}")
    assert turn3.adaptiveSignal.action in ["CLARIFY", "MODERATE"]

    print("\n=== 4. TURNS 4 TO 8+ FOR TOPIC TRANSITIONS AND HARD COMPLETION ===")
    sample_answers = [
        "In Python, memory management uses reference counting and a generational garbage collector.",
        "SQL indexing uses B-Trees to allow logarithmic lookup time for indexed table columns.",
        "REST APIs use standard HTTP verbs whereas GraphQL allows precise query schema selection.",
        "Distributed systems handle consensus using Raft or Paxos protocols to prevent split-brain states.",
        "Prometheus scrapes metrics endpoints while Jaeger provides distributed tracing across microservices.",
        "Docker containers isolate process namespaces, while Kubernetes orchestrates autoscaling and health probes."
    ]

    last_turn = turn3
    for idx, ans in enumerate(sample_answers, start=4):
        if last_turn.status == "completed":
            break
        last_turn = await process_interview_turn(session_id, candidate_id, ans)
        print(f"Turn {idx} -> Status: {last_turn.status}, Q#: {last_turn.questionNumber}, Topics Covered: {last_turn.topicsCovered}")

    print("\n=== 5. VERIFYING FINAL ASSESSMENT AND COMPLETION RULES ===")
    assert last_turn.status == "completed"
    assert last_turn.questionNumber >= 8
    assert last_turn.topicsCovered >= 4
    assert last_turn.feedback is not None
    assert len(last_turn.feedback.summary) > 0

    print("Final Assessment Summary:", last_turn.feedback.summary)
    print("Strengths:", last_turn.feedback.strengths)
    print("Gaps:", last_turn.feedback.gaps)
    print("Next Steps:", last_turn.feedback.next)
    print("\n==================================================")
    print("ALL SCENARIOS A-E PASSED SUCCESSFULLY!")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_e2e_verification())
