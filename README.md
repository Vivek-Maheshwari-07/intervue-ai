# Intervue-AI — AI-Powered Adaptive Technical Interviewer

Intervue-AI is an end-to-end adaptive interview platform. It dynamically assesses candidate technical depth using an adaptive question planner, answer evaluator, curriculum RAG (vector database), and local LLM evaluation (Qwen3 via Ollama) with deterministic rule-based fallbacks.

---

## Quick Start (Single Command)

To run the complete application (Frontend, FastAPI Backend, and Ollama check) in a single command:

```bash
npm run dev
```

This single command uses `concurrently` to start:
1. **Frontend**: React + Vite UI at `http://localhost:5173`
2. **Backend**: FastAPI server at `http://localhost:8000` (liveness probe: `http://localhost:8000/health`)
3. **Ollama Check**: Automatically verifies local Ollama status on `http://localhost:11434`

Works on Windows PowerShell, macOS, and Linux.

---

## Prerequisites

- **Node.js**: v18 or higher (`node -v`)
- **Python**: 3.10 or higher with required packages (`python -m pip install -r backend/requirements.txt -r requirements.txt`)
- **Ollama (Optional)**:
  - If installed and running (`ollama run qwen3`), live LLM generation and evaluations are used.
  - If Ollama is not running, the application seamlessly runs using deterministic fallback evaluations and questions.

---

## Running Tests

### Backend Unit & Integration Tests (Offline)
```bash
python -m pytest backend/tests
```

### Retrieval / RAG Unit Tests
```bash
python -m pytest tests
```

### Production Build Check
```bash
npm run build
```

---

## Project Architecture

```
React LiveInterview UI (src/)
       ↓
POST /api/interview
       ↓
FastAPI Interview Service (backend/services/interview_service.py)
       ↓
Agent Adapter (backend/services/agent_adapter.py)
       ↓
Curriculum RAG (src/retriever.py -> ChromaDB)
       ↓
InterviewAgent (backend/agent/interview_agent.py)
       ↓
Ollama / Qwen3 (or deterministic fallback)
       ↓
SQLite Session Persistence (backend/database/session_manager.py)
```
