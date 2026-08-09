# Intervue AI — AI-Powered Adaptive Technical Interviewer

> **Hackathon Core Goal**: *"Build the interviewer, not the interview."*

**Intervue AI** is a state-of-the-art adaptive technical interviewer system. It evaluates candidates' technical depth using an adaptive question planner, answer evaluator, curriculum RAG (vector database with ChromaDB), candidate personalization, and local LLM evaluation (Qwen3 via Ollama) with deterministic rule-based fallbacks.

---

## Authors & Team Attribution

- **Vivek Maheshwari** — Agent Orchestration, Planner Engine, Evaluator & LLM Integration (Person 1)
- **Aayush Malhotra** — Curriculum RAG Ingestion, ChromaDB Vector Store & Retriever (Person 2)
- **Manav Lathiya** — FastAPI Backend, SQLite Persistence & React Frontend UX (Person 3)

---

## Key Features

1. **Interviewer Orchestration Layer (`InterviewAgent`)**: Single source of truth state machine managing candidate turns, evaluation, dynamic policy planning, and hard completion enforcement.
2. **Code-Enforced Completion Rules**: Interview completes **ONLY** when:
   $$\text{question\_count} \ge 8 \quad \text{AND} \quad \text{unique covered curriculum days} \ge 4$$
3. **Curriculum DAY RAG Tracking (`covered_days`)**: Retrieves vectorized curriculum context from ChromaDB while propagating `"day"` metadata (`Day 1`, `Day 7`, `Day 10`, `Day 16`, etc.) into session state.
4. **Dynamic Answer-Differentiated Fallback**: Operates 100% offline without Ollama or paid APIs. Extracts candidate technical concepts (`Redis`, `PostgreSQL`, `LRU Cache`, etc.) to craft tailored follow-up questions.
5. **Candidate Profile Personalization**: Inspects candidate job role and mission history from `data/candidates.json` to select tailored starting topics and priority areas.
6. **Unified Technical Specification API**: `POST /api/interview` supports the standard Technical Specification format (`sessionId`, `candidate`, `message`, `reply`, `done`, `feedback`).

---

## Architecture Diagram

```
                    ┌─────────────────────────┐
                    │  React 19 Frontend UI   │
                    │  (Light Theme Single)   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                     POST /api/interview (Tech Spec)
                                 │
                    ┌────────────┴────────────┐
                    │    FastAPI Backend      │
                    │  (interview_service)    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     InterviewAgent      │
                    │ (Single Source of Truth)│
                    └────────────┬────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
     QuestionPlanner     AnswerEvaluator       Ollama Qwen3 /
      Policy Engine        Scoring Engine     Offline Fallback
            │                    │
            └──────────┬─────────┘
                       ▼
             Curriculum Retriever
                       │
                       ▼
              ChromaDB Vector Store
                       │
                       ▼
             data/curriculum.json
```

---

## Quick Start (Single Command)

To start the full application (Frontend, FastAPI Backend, and Ollama status check) in a single command:

```bash
npm run dev
```

This single command launches:
1. **Frontend**: React + Vite UI at `http://localhost:5173`
2. **Backend**: FastAPI server at `http://localhost:8000` (Health Check: `http://localhost:8000/health`)
3. **Ollama Status Check**: Verifies local Ollama service at `http://localhost:11434`

---

## Verification & Testing

### 1. Run Complete Backend & Integration Test Suite
```bash
python -m pytest backend/tests tests
```

### 2. Run Adaptive E2E Scenario Verification (Scenarios A–E)
```bash
python tests/test_adaptive_e2e_scenarios.py
```

### 3. Production Build Check
```bash
npm run build
```

---

## API Contract Specification

### 1. Session Start (`POST /api/interview`)
**Request:**
```json
{
  "sessionId": "session-123",
  "candidate": { "id": "CAND-001", "name": "Sarah Johnson" }
}
```
**Response:**
```json
{
  "reply": "Let's now transition to Database Design & Query Optimization...",
  "done": false,
  "sessionId": "session-123"
}
```

### 2. Ongoing Turn (`POST /api/interview`)
**Request:**
```json
{
  "sessionId": "session-123",
  "message": "I used Redis caching with TTL eviction to handle 100x traffic spikes."
}
```
**Response:**
```json
{
  "reply": "Building on your points on redis, how would you architect cache invalidation...",
  "done": false,
  "sessionId": "session-123"
}
```

### 3. Completion (`POST /api/interview`)
**Response when `question_count >= 8` AND `covered_days >= 4`:**
```json
{
  "reply": "Technical interview completed.",
  "done": true,
  "feedback": {
    "summary": "Candidate demonstrated strong skills in Database Design...",
    "strengths": ["Solid competency in Database Design"],
    "gaps": ["Needs improvement in distributed locking edge cases"],
    "next": ["Review specific curriculum modules for identified gaps."]

---

## Production Deployment Guide (100% Free Architecture)

### Hosting Architecture

- **Frontend**: Hosted on **Vercel** (`https://<your-project>.vercel.app`)
- **Backend**: Hosted on **Render** Python Web Service (`https://<your-backend>.onrender.com`)
- **RAG Subsystem**: ChromaDB + SentenceTransformers MiniLM running inside Render backend container
- **Session Persistence**: SQLite database running on Render backend instance
- **AI Model / Ollama**: Connected via `OLLAMA_BASE_URL` (Remote GPU Ollama server, free Modal credits, or built-in deterministic engine fallback)

### Step 1: Deploy Backend to Render (Free Tier)

1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint** or **Web Service**.
3. Connect your GitHub repository: `https://github.com/Vivek-Maheshwari-07/intervue-ai.git`.
4. Render automatically detects `render.yaml`:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables in Render:
   - `CORS_ORIGINS`: `https://<your-vercel-app>.vercel.app,*`
   - `OLLAMA_BASE_URL`: `<your-remote-ollama-url-or-leave-default>`
6. Deploy service. Once live, note your backend URL (e.g. `https://intervue-ai-backend.onrender.com`).

### Step 2: Deploy Frontend to Vercel (Free Tier)

1. Log into [Vercel Dashboard](https://vercel.com).
2. Click **Add New Project** -> Import `intervue-ai` from GitHub.
3. Set Environment Variable:
   - `VITE_API_URL`: `https://intervue-ai-backend.onrender.com`
4. Click **Deploy**. Vercel will build and assign your live URL (e.g., `https://intervue-ai.vercel.app`).

