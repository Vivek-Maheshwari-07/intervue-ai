# Hackathon AI Usage Log — PROMPTS.md

## Entry 1 — Person 1 (AI / Agent Engineer Foundation)

### Prompt Received
User prompt requesting Person 1 responsibility implementation for the ABTalks Vibe Code Hackathon:
- Project: `intervue-ai`
- Role: Person 1 (AI / Agent Engineer)
- Task: Create the Python AI Interview Agent foundation with explicit state management, answer evaluator, adaptive question planner, prompt definitions, hard completion enforcement rule, feedback synthesis, and independent unit tests.

### Implementation Summary
- **Inspection Phase**: Verified repository state. Preserved existing React frontend in `src/` untouched. Created modular Python backend architecture under `backend/agent/` and `backend/tests/`.
- **State Model** (`backend/agent/state.py`): Built dataclass-based state model tracking `question_count`, `covered_days`, `covered_topics`, `conversation_history`, `scores`, `evaluations`, `current_topic`, `current_day`, `status`, and candidate info. Implemented `to_dict()` and `from_dict()` for SQLite persistence by Person 3.
- **Answer Evaluator** (`backend/agent/evaluator.py`): Implemented `evaluate_answer(...)` mapping scores (0-10) to quality levels (`weak`, `moderate`, `strong`, `excellent`). Configured threshold constants (`0-3` weak, `4-6` moderate, `7-8` strong, `9-10` excellent). Included rule-based offline evaluator for deterministic testing.
- **Adaptive Question Planner** (`backend/agent/question_planner.py`): Implemented policy engine for action selection (`HARDER`, `CLARIFY`, `MODERATE`, `NEW_TOPIC`). Strong/excellent triggers difficulty escalation or topic progression; weak triggers clarification on same topic; moderate triggers moderate follow-up. Policy is code-enforced rather than delegated to LLM.
- **Hard Interview Completion Rule** (`backend/agent/interview_agent.py`): Implemented `should_end()` checking `question_count >= 8 AND unique_covered_count >= 4`. Explicit Python code check enforcing BOTH requirements.
- **Prompt Definitions** (`backend/agent/prompts.py`): Defined structured templates for system interviewer persona, question generation, answer evaluation, and final feedback synthesis. Grounded prompts in curriculum context and instructed LLM not to decide completion rules.
- **Final Feedback Generator** (`backend/agent/feedback.py`): Synthesized feedback matching exact required JSON schema: `{"summary": "...", "strengths": [...], "gaps": [...], "next": [...]}` based on recorded turn evaluations.
- **Decoupled Interfaces**: Provided pluggable hooks for Person 2 (`CurriculumRetriever.search_curriculum(query)`) and Person 3 (`to_dict()` / `from_dict()` for SQLite persistence).
- **Independent Test Suite** (`backend/tests/test_agent.py`): 12 offline unit tests validating evaluator mapping, planner actions, hard completion rules, state updates, and feedback schema without network/external dependencies.

### Files Created
- `backend/agent/__init__.py`
- `backend/agent/state.py`
- `backend/agent/evaluator.py`
- `backend/agent/question_planner.py`
- `backend/agent/prompts.py`
- `backend/agent/feedback.py`
- `backend/agent/interview_agent.py`
- `backend/tests/test_agent.py`
- `PROMPTS.md`

### Files Modified
None (Existing frontend in `src/` left completely untouched).

### Key Architectural Decisions Made
1. **Source of Truth**: Python agent code controls state, topic counts, question counts, and completion checks. LLM generates questions and evaluates responses but never decides completion policy.
2. **Decoupling**: Evaluator, planner, and curriculum retriever use function interfaces/fallbacks so LLM / Qwen3, ChromaDB RAG, and FastAPI can be connected seamlessly by teammates.
