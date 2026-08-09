# AI Usage & Prompt Log — PROMPTS.md

## Overview & Purpose

This document serves as the official **AI-Assisted Development Log** for **Intervue AI** (ABTalks Vibe Code Hackathon submission). It details the prompt history, architectural directives, implementation workflows, and human engineering verification performed throughout the development of the project.

AI assistance was utilized systematically for repository analysis, backend refactoring, state model design, RAG metadata propagation, offline fallback engine engineering, responsive UI/UX refinement, and automated test suite creation. All code generated and modified was thoroughly reviewed, verified, and tested by the engineering team.

---

## Section 1 — Project & AI Development Context

### Primary Goal
Build an **AI Technical Interviewer** platform that embodies the core hackathon problem statement: *"Build the interviewer, not the interview."*

### Key Capabilities
- **Multi-Turn Adaptive Questioning**: Evaluates candidate responses in real-time and adjusts question difficulty (`HARDER`, `CLARIFY`, `MODERATE`, `NEW_TOPIC`).
- **Curriculum RAG Grounding**: Queries ChromaDB vector embeddings populated from `data/curriculum.json` to anchor interview questions in specific curriculum topics and daily milestones.
- **Code-Enforced Completion Rules**: Ensures interviews run for at least **8 questions** AND cover at least **4 unique curriculum days/topics** before terminating.
- **Dynamic Offline Fallback Engine**: Generates candidate answer-differentiated follow-up questions offline when LLM services are unavailable.
- **Candidate Personalization**: Adapts starting topics and evaluation criteria based on candidate background profiles (`data/candidates.json`).
- **Structured Final Assessment**: Computes objective readiness scores and synthesizes structured performance feedback (`summary`, `strengths`, `gaps`, `next_steps`).

---

## Section 2 — Architecture & Backend Audit

### Prompt Summary
*Inspect the entire codebase before making changes. Identify architectural bottlenecks, duplicate orchestration layers, schema mismatches, state synchronization issues, RAG metadata propagation gaps, and fallback limitations.*

### Key Insights & Task Items Identified
1. **Orchestration Duplication**: Found separate state logic between `InterviewAgent` (`backend/agent/interview_agent.py`) and FastAPI endpoints (`backend/api/interview.py`). Unified orchestration under `InterviewAgent`.
2. **API Payload Alignment**: Aligned FastAPI schemas (`backend/models/schemas.py`) with the public Technical Specification contract (`sessionId`, `candidateId`, `message`, `reply`, `done`).
3. **Curriculum DAY Tracking**: Enhanced ChromaDB document metadata retrieval to extract day tags (`"day": "Day 07"`) and propagate them into `state.covered_days`.
4. **LLM Connection Resilience**: Added a 60-second cooldown recovery mechanism for Ollama connection dropouts to eliminate permanent offline state lock.

---

## Section 3 — Prompt 1: Architecture & API Foundation (Step 1)

### Instruction / Purpose
> *"Fix foundational backend and architecture problems. Establish `InterviewAgent` as the single authoritative orchestration layer. Align API contracts with the Technical Specification, enforce HTTP + persistence separation in the service layer, and preserve existing unit tests."*

### Development Results
- **Dataclass State Model** ([backend/agent/state.py](file:///d:/Programing/Projects/intervue-ai/backend/agent/state.py)): Standardized `InterviewAgentState` with serialization helpers (`to_dict()`, `from_dict()`).
- **Rule-Based Answer Evaluator** ([backend/agent/evaluator.py](file:///d:/Programing/Projects/intervue-ai/backend/agent/evaluator.py)): Code-enforced score mapping (0–10) to quality tiers (`weak`, `moderate`, `strong`, `excellent`).
- **Adaptive Policy Planner** ([backend/agent/question_planner.py](file:///d:/Programing/Projects/intervue-ai/backend/agent/question_planner.py)): Policy engine driving difficulty adjustments based on candidate answer scores.
- **FastAPI HTTP Layer** ([backend/api/interview.py](file:///d:/Programing/Projects/intervue-ai/backend/api/interview.py)): Standardized POST `/api/interview` supporting START (`sessionId`, `candidateId`) and TURN (`message`, `answer`) payloads.
- **Session Synchronization**: Synchronized SQLite session storage ([backend/database/session_manager.py](file:///d:/Programing/Projects/intervue-ai/backend/database/session_manager.py)) across turns.

---

## Section 4 — Prompt 2: RAG, Curriculum Days & Adaptive Intelligence (Step 2)

### Instruction / Purpose
> *"Propagate ChromaDB curriculum day metadata, enforce minimum 8 questions AND 4 unique curriculum days for interview completion, implement dynamic answer-differentiated fallback, and personalize initial interview topics."*

### Development Results
- **RAG Metadata Propagation**: Updated `CurriculumRetriever` ([tests/test_retrieval.py](file:///d:/Programing/Projects/intervue-ai/tests/test_retrieval.py)) to return day tags (`"Day 01"` through `"Day 16"`).
- **Code-Enforced Completion Rules**: Updated `should_end()` in `InterviewAgent`:
  $$\text{question\_count} \ge 8 \quad \text{AND} \quad \text{unique\_covered\_days} \ge 4$$
- **Dynamic Offline Fallback Engine**: Implemented key concept extraction (`extract_key_concepts`) to construct answer-dependent follow-up questions without external LLM dependencies.
- **Candidate Personalization**: Integrated candidate history from `data/candidates.json` to select role-relevant initial curriculum topics.

---

## Section 5 — Prompt 3: Finalization & Hackathon Readiness (Step 3)

### Instruction / Purpose
> *"Integrate React frontend with API, implement robust loading/error states, calculate real readiness scores in feedback reports, recover from Ollama connection dropouts, run full integration test suite, and update project documentation."*

### Development Results
- **Real Assessment Metrics**: Updated [src/components/Feedback.jsx](file:///d:/Programing/Projects/intervue-ai/src/components/Feedback.jsx) to calculate candidate readiness scores directly from backend evaluation scores.
- **Ollama Cooldown Timer**: Configured 60-second cooldown recovery for local Ollama LLM requests.
- **Comprehensive Testing**: Validated backend test suite (`35 passed in 25s`) and end-to-end adaptive scenarios (Scenarios A–E passed).
- **Documentation**: Updated `README.md` and initialized production environment configurations.

---

## Section 6 — Live Interview UI Refinement & Theme Alignment

### Instruction / Purpose
> *"Redesign the Live Interview screen to maintain visual consistency with the Candidate Selection screen. Eliminate dark mode contrast and maintain a unified light/white design system across the product."*

### Development Results
- **Unified Color Palette**: Applied page background `#F8FAFC`, card background `#FFFFFF`, border `#E2E8F0`, text `#0F172A`, and primary blue `#2563EB`.
- **Semantic Accents**: Retained high-contrast semantic accents for `AdaptiveSignal.jsx`:
  - `HARDER`: `#7F77DD` (Purple)
  - `CLARIFY`: `#F0994D` (Amber)
  - `NEW_TOPIC`: `#22D3A6` (Teal)
  - `MODERATE`: `#94A3B8` (Neutral Gray)
- **Typography Hierarchy**: Standardized `Plus Jakarta Sans` for body/headings and `JetBrains Mono` for technical counters, badges, and candidate response text.

---

## Section 7 — Candidate Selection & Copy-Protection UX

### Instruction / Purpose
> *"Fix accidental text highlighting during candidate selection card clicks. Implement targeted anti-copy/paste protection strictly on the Live Interview screen while preserving candidate typing and editing functionality."*

### Development Results
- **Selection Clearing**: Added `window.getSelection()?.removeAllRanges()` on candidate card click to prevent accidental browser text highlights.
- **Selected Card Styling**: Enhanced candidate card states with border `#2563EB`, background tint `#EFF6FF/60`, and visible `✓ Selected` badge.
- **Live Interview Copy Protection**: Restricted question prompt copy/cut/drag and context menu (`onContextMenu`).
- **Non-Intrusive Paste Prevention**: Intercepted paste attempts (`onPaste`, `Ctrl+V`, `Cmd+V`, `Shift+Insert`) on the answer textarea with a temporary warning toast (*"Paste is disabled during the live technical interview."*).
- **Normal Candidate Typing**: Allowed 100% normal typing, Backspace, Delete, Arrow keys, Enter, and editing of candidate's own typed response.

---

## Section 8 — Interview Start & Loading State UX

### Instruction / Purpose
> *"Eliminate static loading text in question cards. Ensure clean transition from candidate selection to interview start, display active loading spinners during LLM generation, and provide retry controls on error."*

### Development Results
- **Dynamic Question Loading**: Replaced placeholder question text with inline loading spinners (`Loader2`) during question generation.
- **Error & Retry Handling**: Rendered actionable error cards with single-click `Retry` controls if network or backend requests fail.
- **Progress Tracking**: Updated `Question Progress` counter (`01 / 08+`) and `Curriculum Coverage` day indicators.

---

## Section 9 — Light Theme Visual Consistency Alignment

### Instruction / Purpose
> *"Align the Live Interview room styling directly with Candidate Details. Ensure header, cards, borders, typography, buttons, and progress indicators feel like a single unified product."*

### Development Results
- **Page Layout**: Updated [src/App.jsx](file:///d:/Programing/Projects/intervue-ai/src/App.jsx) and [src/components/Navbar.jsx](file:///d:/Programing/Projects/intervue-ai/src/components/Navbar.jsx) to maintain `#F8FAFC` background across all navigation tabs.
- **Card Hierarchy**: Standardized `#FFFFFF` cards with `#E2E8F0` borders across candidate selection, live interview, and feedback report screens.

---

## Section 10 — Responsive Mobile & Touch UX Optimization

### Instruction / Purpose
> *"Make the entire frontend responsive and touch-friendly across mobile (360px–414px), tablet (640px–1024px), and desktop (> 1024px) viewports without horizontal scrolling or desktop layout regressions."*

### Development Results
- **Mobile Touch Header** ([src/components/Navbar.jsx](file:///d:/Programing/Projects/intervue-ai/src/components/Navbar.jsx)): 2-column grid touch navigation bar with `py-2.5 px-3` touch targets.
- **Candidate Selection Layout** ([src/components/CandidateDetails.jsx](file:///d:/Programing/Projects/intervue-ai/src/components/CandidateDetails.jsx)): Stacked single-column hierarchy for narrow viewports (`grid-cols-1 lg:grid-cols-3`).
- **Live Interview Stacking** ([src/components/AIInterviewer.jsx](file:///d:/Programing/Projects/intervue-ai/src/components/AIInterviewer.jsx)): Stacked question card, response area, full-width submit button (`w-full sm:w-auto`), and sidebar modules on screens `< 1024px`.
- **Zero Horizontal Scroll**: Added `truncate`, `min-w-0`, and flexible grid rules ensuring zero horizontal overflow on 360px mobile viewports.

---

## Section 11 — Live Deployment Preparation & Environment Configuration

### Instruction / Purpose
> *"Prepare production deployment configurations (Vercel frontend, Render/FastAPI backend), support environment variables, configure CORS, and document public deployment steps."*

### Development Results
- **Vercel SPA Configuration**: Created [vercel.json](file:///d:/Programing/Projects/intervue-ai/vercel.json) with Vite SPA rewrite rules.
- **Render Backend Blueprint**: Created [render.yaml](file:///d:/Programing/Projects/intervue-ai/render.yaml) specifying Uvicorn start commands and `CORS_ORIGINS` configuration.
- **Environment API Base**: Supported `VITE_API_URL` in [src/services/api.js](file:///d:/Programing/Projects/intervue-ai/src/services/api.js) and `CORS_ORIGINS` in [backend/main.py](file:///d:/Programing/Projects/intervue-ai/backend/main.py).

---

## Section 12 — AI Usage Principles & Human Engineering Review

AI tools were utilized as an extension of the engineering workflow. Human oversight was applied at every stage:
1. **Architectural Control**: Code-enforced rules (e.g., `8+ questions AND 4+ curriculum days`) were defined programmatically rather than delegated to LLM decision-making.
2. **Deterministic Fallbacks**: Offline fallback engines were implemented to ensure system reliability independent of cloud API availability.
3. **Rigorous Testing**: All AI-assisted refactors were validated against independent pytest suites (`35 passed in 27s`) and Vite production builds.

---

## Section 13 — Team Workstream & Responsibility Mapping

| Team Member | Role | Key Contributions |
|---|---|---|
| **Vivek Maheshwari** | Person 1 — AI / Agent Engineer | `InterviewAgent` state engine, adaptive question planner, answer evaluator, feedback generator, prompt definitions, unit test suite. |
| **Aayush Malhotra** | Person 2 — Curriculum RAG | `CurriculumRetriever`, ChromaDB vector embeddings (`all-MiniLM-L6-v2`), `data/curriculum.json` day metadata parsing. |
| **Manav Lathiya** | Person 3 — Backend & Frontend UX | FastAPI API service, SQLite session persistence, React frontend UI, responsive design system, copy-protection UX. |

---

## Section 14 — Prompt Log Summary Table

| # | Workstream / Prompt Focus | Development Purpose | Primary Area |
|---|---|---|---|
| 1 | Repository Architecture Audit | Identify orchestration bottlenecks and API mismatches | Backend |
| 2 | Step 1 — Architecture & API Foundation | Single source of truth in `InterviewAgent`, schema alignment | Backend / API |
| 3 | Step 2 — RAG & Curriculum Days | ChromaDB day metadata propagation, minimum completion rules | AI / RAG |
| 4 | Step 3 — Finalization & Readiness | Ollama cooldown recovery, real evaluation scores, test suite | Full Stack |
| 5 | Live Interview UI Redesign | Establish light theme technical interview layout | Frontend |
| 6 | Selection & Copy-Protection UX | Fix card text highlight bug, targeted live interview paste blocking | Frontend |
| 7 | Interview Loading & State UX | Add inline loading spinners and error retry controls | Frontend |
| 8 | Light Theme Consistency | Align interview room styling with candidate selection | Frontend |
| 9 | AI-Usage Log URL | Implement verified GitHub `PROMPTS.md` link component | Documentation / UI |
| 10 | Live Deployment Preparation | Create `vercel.json`, `render.yaml`, environment variable API base | DevOps |
| 11 | Mobile & Responsive UX | Optimize layout for 360px–414px mobile phones and tablets | Frontend |
