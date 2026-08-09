# Hackathon AI Usage Log — PROMPTS.md

## Team Members & Attribution
- **Vivek Maheshwari** — Person 1 (Agent Orchestration, Planner Engine, Evaluator & LLM Integration)
- **Aayush Malhotra** — Person 2 (Curriculum RAG Ingestion, ChromaDB Vector Store & Retriever)
- **Manav Lathiya** — Person 3 (FastAPI Backend, SQLite Persistence & React Frontend UX)

---

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

---

## Entry 2 — Person 2 (Curriculum RAG & Ingestion)

### Implementation Summary
- **Curriculum Parser** (`src/curriculum_parser.py`): Parsed `data/curriculum.json` into ChromaDB documents, preserving `"day"` (`Day 1` .. `Day 31`), `"title"`, `"type"`, and `"tools"` metadata.
- **Vector Store & Retriever** (`src/vector_store.py`, `src/retriever.py`): Vectorized curriculum records using sentence-transformers embedding functions (`all-MiniLM-L6-v2`) in ChromaDB. Added auto-ingestion on first query.

---

## Entry 3 — Person 3 (FastAPI Service, SQLite & Unified Frontend UX)

### Implementation Summary
- **FastAPI Endpoints** (`backend/api/interview.py`, `backend/services/interview_service.py`): Provided HTTP interface for starting and progressing technical interviews. Synchronized turn state with SQLite (`session_manager.py`).
- **React Frontend UI** (`src/components/`, `src/hooks/useInterview.js`): Refactored UI to light theme single canonical layout with hero component, candidate details selector, adaptive signal drawer, and structured feedback report.

---

## Entry 4 — Refactoring STEP 1: Single Source of Truth & Technical Specification API

### Implementation Summary
- **Single Source of Truth**: Made `InterviewAgent` in `backend/agent/interview_agent.py` the authoritative orchestration layer across turns, answer evaluation, and completion rules.
- **Technical Specification API Payload**: Updated `backend/models/schemas.py` and `backend/api/interview.py` to accept `candidate`, `message`, `sessionId`, and return `reply` and `done` flags.
- **Session Synchronization**: Synchronized SQLite session persistence with `InterviewAgentState` after every turn.

---

## Entry 5 — Refactoring STEP 2 & STEP 3: Curriculum DAY Coverage, Offline Fallback & Hackathon Readiness

### Implementation Summary
- **Curriculum DAY Tracking & RAG Metadata**: Propagated ChromaDB document metadata (`"day": 7`, `"title": "Embeddings Explained"`) directly into `state.covered_days`. Enforced `should_end()` checking `question_count >= 8 AND covered_days >= 4`.
- **Dynamic Answer-Differentiated Fallback**: Implemented concept extraction (`extract_key_concepts`) to generate tailored follow-up questions offline based on candidate answer text.
- **Candidate Personalization**: Personalizes starting topic and topic prioritization from candidate records in `data/candidates.json`.
- **Ollama Cooldown Recovery**: Replaced permanent offline latch with a 60-second cooldown timer for automatic connection recovery.
- **Real Readiness Score Metrics**: Updated `Feedback.jsx` to display real evaluation metrics computed from backend turn evaluation scores.
- **Full Verification & Testing**: All 35 pytest unit & integration tests passed cleanly in 26s; E2E Scenarios A–E passed; `npm run build` succeeded.
