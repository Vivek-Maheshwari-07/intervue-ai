"""FastAPI application entry point for the Intervue AI backend."""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.interview import router as interview_router
from database.database import init_db

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info("Initialising SQLite database …")
    await init_db()
    logger.info("Database ready.")
    yield
    logger.info("Shutting down …")


app = FastAPI(
    title="Intervue AI — Interview Backend",
    description="AI-powered adaptive interview API",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Allow the Vite dev server and common local origins.
ALLOWED_ORIGINS = [
    origin.strip() for origin in os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,*",
    ).split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(interview_router)


@app.get("/health")
async def health_check():
    """Simple liveness probe."""
    return {"status": "ok", "service": "intervue-ai-backend"}
