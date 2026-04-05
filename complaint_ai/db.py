"""
db.py — MongoDB interface for complaint storage and status management.

Schema design (one document per complaint):
  Identity:      complaint_id (UUID), source channel
  Input:         raw complaint text
  Classification: category, confidence, priority, action, resolution
  Workflow:      status (open → in_progress → resolved → closed), agent_version
  Timestamps:    timestamp (created), updated_at, resolved_at (nullable)

Indexes created at module import (idempotent, background-safe):
  - (status, priority): fast agent queue queries
  - timestamp DESC:     time-range queries and dashboards
  - category:           filtering by complaint type
  - complaint_id UNIQUE: guaranteed single-document lookups
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import UUID

from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.collection import Collection

import config
from logger import get_logger

logger = get_logger(__name__)


# ── Client & Collection ───────────────────────────────────────────────────────

_client = MongoClient(
    config.MONGO_URI,
    serverSelectionTimeoutMS=5000,
    tlsAllowInvalidCertificates=True,  # Fix for local macOS SSL cert verification
)

_db = _client[config.MONGO_DB_NAME]
complaints_collection: Collection = _db["complaints"]


# ── Indexes ───────────────────────────────────────────────────────────────────

def _ensure_indexes() -> None:
    """
    Create indexes for the most common access patterns.
    `background=True` prevents index creation from blocking active reads.
    This function is idempotent — safe to call multiple times.
    """
    complaints_collection.create_index(
        [("status", ASCENDING), ("priority", DESCENDING)],
        name="idx_status_priority",
        background=True,
    )
    complaints_collection.create_index(
        [("timestamp", DESCENDING)],
        name="idx_timestamp",
        background=True,
    )
    complaints_collection.create_index(
        [("category", ASCENDING)],
        name="idx_category",
        background=True,
    )
    complaints_collection.create_index(
        [("complaint_id", ASCENDING)],
        name="idx_complaint_id",
        unique=True,
        background=True,
    )
    logger.info("MongoDB indexes verified.")


# Run at import time so the collection is always properly indexed
try:
    _ensure_indexes()
except Exception as exc:
    logger.warning("Could not create MongoDB indexes (will retry on next start): %s", exc)


# ── Write Operations ──────────────────────────────────────────────────────────

def save_complaint(
    complaint: str,
    result: Dict[str, Any],
    complaint_id: Optional[str] = None,
    source: str = "api",
) -> str:
    """
    Persist a classified complaint to MongoDB.

    Args:
        complaint:    Raw complaint text from the user.
        result:       Classification dict produced by the agent pipeline.
        complaint_id: UUID string generated upstream (api.py / main.py).
                      A nil UUID is used as a safe fallback if omitted.
        source:       Submission channel — 'api', 'cli', 'batch', etc.

    Returns:
        The complaint_id string for end-to-end traceability.
    """
    now = datetime.now(timezone.utc)

    document = {
        # ── Identity ──────────────────────────────────────────────────────
        "complaint_id": complaint_id or str(UUID(int=0)),
        "source": source,

        # ── Input ─────────────────────────────────────────────────────────
        "complaint_text": complaint,

        # ── Classification ────────────────────────────────────────────────
        "category": result.get("category", "other"),
        "confidence": result.get("confidence", 0.0),
        "priority": result.get("priority", "MEDIUM"),
        "action": result.get("action", "HUMAN"),
        "resolution": result.get("resolution", ""),

        # ── Workflow ──────────────────────────────────────────────────────
        "status": "open",          # Lifecycle: open → in_progress → resolved → closed
        "agent_version": config.AGENT_VERSION,

        # ── Timestamps ────────────────────────────────────────────────────
        "timestamp": now,          # Created at
        "updated_at": now,         # Last modified
        "resolved_at": None,       # Populated when status → resolved
    }

    try:
        complaints_collection.insert_one(document)
        logger.info(
            "Complaint saved | id=%s category=%s priority=%s action=%s",
            complaint_id,
            document["category"],
            document["priority"],
            document["action"],
        )
    except Exception as exc:
        logger.error(
            "Failed to save complaint to MongoDB | id=%s error=%s",
            complaint_id,
            exc,
            exc_info=True,
        )

    return complaint_id or ""


def update_complaint_status(complaint_id: str, status: str) -> bool:
    """
    Transition a complaint through the lifecycle state machine.

    Valid statuses: open → in_progress → resolved → closed

    Sets `resolved_at` automatically when status becomes 'resolved'.
    Returns True if the document was found and updated, False if not found.
    """
    valid_statuses = {"open", "in_progress", "resolved", "closed"}
    if status not in valid_statuses:
        logger.warning(
            "Invalid status '%s' — must be one of %s",
            status,
            valid_statuses,
        )
        return False

    now = datetime.now(timezone.utc)
    update_fields: Dict[str, Any] = {"status": status, "updated_at": now}

    if status == "resolved":
        update_fields["resolved_at"] = now

    result = complaints_collection.update_one(
        {"complaint_id": complaint_id},
        {"$set": update_fields},
    )

    if result.matched_count == 0:
        logger.warning("Complaint not found for status update | id=%s", complaint_id)
        return False

    logger.info("Status updated | id=%s → %s", complaint_id, status)
    return True