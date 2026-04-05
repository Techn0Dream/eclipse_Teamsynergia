"""
config.py — Centralized configuration for Complaint AI.

All environment variables are loaded here via python-dotenv.
Every other module imports constants from this file instead of hardcoding.
To configure the system, copy .env.example → .env and fill in your values.
"""

import os

from dotenv import load_dotenv

# Load variables from a .env file if it exists (silently skipped otherwise)
load_dotenv()

# ── MongoDB ───────────────────────────────────────────────────────────────────
MONGO_URI: str = os.getenv(
    "MONGO_URI",
    "mongodb://localhost:27017",  # Safe local fallback for development
)
MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "complaint_ai")

# ── Gemini LLM ────────────────────────────────────────────────────────────────
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# ── RAG / FAISS ───────────────────────────────────────────────────────────────
RAG_SAMPLE_LIMIT: int = int(os.getenv("RAG_SAMPLE_LIMIT", "5000"))  # rows to load from CSV
RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "5"))                   # neighbours to retrieve
RAG_CSV_PATH: str = os.getenv("RAG_CSV_PATH", "data.csv")
EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FILE: str = os.getenv("LOG_FILE", "logs/complaint_ai.log")

# ── Agent ─────────────────────────────────────────────────────────────────────
AGENT_VERSION: str = "1.0.0"

# Complaints scored below this threshold are escalated to human review
# regardless of what the LLM suggested.
LOW_CONFIDENCE_THRESHOLD: float = float(os.getenv("LOW_CONFIDENCE_THRESHOLD", "0.5"))
