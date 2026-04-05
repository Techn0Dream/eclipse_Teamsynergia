"""
main.py — Orchestration layer for the complaint processing pipeline.

Ties together:
  1. LangGraph agent (retrieve → llm → decide)
  2. MongoDB persistence   (db.save_complaint)
  3. FAISS dynamic learning (rag.add_to_vector_db)

Responsibilities:
  - Generates a UUID per request for end-to-end traceability.
  - Times the pipeline and logs duration for observability.
  - Returns a graceful fallback dict on any unrecoverable error
    (the caller — api.py — never gets an exception from here).

Usage:
  - Imported and called by api.py for HTTP-triggered requests.
  - Run directly for local testing:
      python main.py
"""

import time
import uuid
from typing import Any, Dict, Optional

from agent import app as agent_app
from db import save_complaint
from logger import get_logger
from rag import add_to_vector_db

logger = get_logger(__name__)


# ── Fallback Result ───────────────────────────────────────────────────────────
# Returned when the agent pipeline raises an unrecoverable exception.
# Confidence 0.0 ensures it is treated as an escalation by any downstream consumer.

_FALLBACK_RESULT: Dict[str, Any] = {
    "category": "other",
    "confidence": 0.0,
    "priority": "MEDIUM",
    "action": "HUMAN",
    "resolution": (
        "Unable to process automatically. "
        "Complaint has been queued for manual review."
    ),
}


# ── Main Processing Function ──────────────────────────────────────────────────

def process_complaint(
    complaint: str,
    complaint_id: Optional[str] = None,
    source: str = "api",
) -> Dict[str, Any]:
    """
    Run the full complaint processing pipeline for a single complaint text.

    Steps:
      1. Invoke the LangGraph agent (RAG → LLM → Decision rules).
      2. Persist the classification result to MongoDB.
      3. Add the complaint to the live FAISS index (continuous learning).

    Args:
        complaint:    Raw complaint text from the user.
        complaint_id: UUID string for end-to-end tracing. Auto-generated if omitted.
        source:       Submission channel ('api', 'cli', 'batch', etc.).

    Returns:
        Dict with keys: category, confidence, priority, action, resolution.
        Always returns a valid dict — falls back to `_FALLBACK_RESULT` on error.
    """
    complaint_id = complaint_id or str(uuid.uuid4())
    start_time = time.perf_counter()

    logger.info(
        "Processing complaint | id=%s source=%s text='%.60s…'",
        complaint_id,
        source,
        complaint,
    )

    try:
        # ── Step 1: Run LangGraph agent ───────────────────────────────────────
        agent_output = agent_app.invoke({"complaint": complaint})
        result = agent_output.get("result")

        if not result or "category" not in result:
            raise ValueError(f"Agent returned unexpected output structure: {agent_output}")

        # ── Step 2: Persist to MongoDB ────────────────────────────────────────
        save_complaint(complaint, result, complaint_id=complaint_id, source=source)

        # ── Step 3: Update live FAISS index ───────────────────────────────────
        add_to_vector_db(complaint)

        elapsed = time.perf_counter() - start_time
        logger.info(
            "Pipeline complete | id=%s category=%s priority=%s action=%s duration=%.2fs",
            complaint_id,
            result["category"],
            result["priority"],
            result["action"],
            elapsed,
        )
        return result

    except Exception as exc:
        elapsed = time.perf_counter() - start_time
        logger.error(
            "Pipeline failed | id=%s duration=%.2fs error=%s",
            complaint_id,
            elapsed,
            exc,
            exc_info=True,
        )

        # Best-effort: attempt to record the failed classification in MongoDB
        # so support staff can see that the complaint arrived but failed.
        try:
            save_complaint(
                complaint, _FALLBACK_RESULT, complaint_id=complaint_id, source=source
            )
        except Exception:
            pass  # DB write failure is non-fatal; the main error is already logged

        return _FALLBACK_RESULT.copy()


# ── CLI Entry Point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    test_complaint = (
        "Money was deducted from my account but not received by the beneficiary."
    )
    print("\n── Complaint AI — Local Test ─────────────────────────────────────")
    print(f"  INPUT : {test_complaint}")
    print("─" * 66)

    output = process_complaint(test_complaint, source="cli")

    print("  OUTPUT:")
    for key, value in output.items():
        print(f"    {key:12s}: {value}")
    print("─" * 66)