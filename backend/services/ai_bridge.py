"""
ai_bridge.py — Bridge between the backend service layer and the complaint_ai module.

This module is the ONLY file that knows about complaint_ai's internals.
All other backend code stays unchanged and calls process_complaint() through
backend/services/agent.py as before.

Design:
  - Adds complaint_ai/ to sys.path at import time so its local imports resolve.
  - Calls complaint_ai.main.process_complaint() as a plain function (no HTTP hop).
  - Adapts the AI pipeline's output dict to the full ComplaintResponse shape,
    deriving missing fields (sentiment, severity, estimated_resolution_time,
    priority_color, confidence_score) from the available AI output.
  - Falls back gracefully — on any import or runtime error, returns a safe
    default dict so the backend route never crashes.
"""

from __future__ import annotations

import logging
import os
import sys
from typing import Any

logger = logging.getLogger(__name__)

# ── Add complaint_ai/ to sys.path ─────────────────────────────────────────────
# This file lives at:  <project_root>/backend/services/ai_bridge.py
# complaint_ai/ lives at: <project_root>/complaint_ai/
# So we walk two levels up (services/ → backend/ → project_root/).

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))  # …/backend/services
_PROJECT_ROOT = os.path.abspath(os.path.join(_THIS_DIR, "..", ".."))  # …/ai-banking-intelligence
_AI_MODULE_DIR = os.path.join(_PROJECT_ROOT, "complaint_ai")

if _AI_MODULE_DIR not in sys.path:
    sys.path.insert(0, _AI_MODULE_DIR)

logger.info("ai_bridge: complaint_ai module path registered → %s", _AI_MODULE_DIR)


# ── Import the AI pipeline (lazy — errors logged, not raised) ─────────────────

_ai_process_complaint = None

try:
    from main import process_complaint as _ai_process_complaint  # noqa: E402
    logger.info("ai_bridge: complaint_ai pipeline imported successfully.")
except Exception as _import_err:
    logger.error(
        "ai_bridge: Failed to import complaint_ai pipeline — "
        "AI features will use fallback. Error: %s",
        _import_err,
        exc_info=True,
    )


# ── Field Derivation Maps ─────────────────────────────────────────────────────

_PRIORITY_COLOR: dict[str, str] = {
    "CRITICAL": "red",
    "HIGH": "red",
    "MEDIUM": "orange",
    "LOW": "green",
}

_PRIORITY_ETA: dict[str, str] = {
    "CRITICAL": "1-2 hours",
    "HIGH": "2-4 hours",
    "MEDIUM": "24 hours",
    "LOW": "48 hours",
}

_RESOLUTION_BY_CATEGORY: dict[str, str] = {
    "fraud":       "Account has been blocked and a full investigation has been initiated.",
    "transaction": "Refund will be processed and confirmed within 24 hours.",
    "login":       "Password reset link has been sent. Please check your registered email.",
    "account":     "Your account issue has been flagged for priority review.",
    "card":        "Card request has been escalated to our card services team.",
    "loan":        "Loan case has been forwarded to the relevant department.",
    "other":       "Your complaint has been queued and will be reviewed shortly.",
}

# Safe fallback returned when the AI pipeline is unavailable
_BRIDGE_FALLBACK: dict[str, Any] = {
    "category": "other",
    "sentiment": "neutral",
    "severity": "medium",
    "priority": "MEDIUM",
    "priority_color": "orange",
    "action": "human_support",
    "resolution": "Unable to process automatically. Complaint has been queued for manual review.",
    "estimated_resolution_time": "24 hours",
    "confidence_score": 0.0,
}


# ── Helper: derive sentiment from confidence ──────────────────────────────────

def _infer_sentiment(confidence: float) -> str:
    """
    Infer a coarse sentiment label from the AI confidence score.
    Low confidence often signals uncertain / frustrated customer language.
    The frontend displays this in the Analysis card under 'SENTIMENT'.
    """
    if confidence >= 0.75:
        return "negative"   # High confidence = clear distress signal
    if confidence >= 0.5:
        return "neutral"
    return "mixed"


# ── Helper: derive severity from priority ─────────────────────────────────────

def _infer_severity(priority: str) -> str:
    """Map the AI's priority string to a severity label for the frontend."""
    mapping = {
        "CRITICAL": "critical",
        "HIGH": "high",
        "MEDIUM": "medium",
        "LOW": "low",
    }
    return mapping.get(priority.upper(), "medium")


# ── Helper: normalize action string ──────────────────────────────────────────

def _normalize_action(action: str) -> str:
    """
    complaint_ai uses 'AUTO' / 'HUMAN'.
    The backend schema expects 'auto_resolve' / 'human_support'.
    Map between the two.
    """
    mapping = {
        "AUTO": "auto_resolve",
        "HUMAN": "human_support",
        # Pass-through if already in backend format
        "auto_resolve": "auto_resolve",
        "human_support": "human_support",
    }
    return mapping.get(str(action).upper(), "human_support")


# ── Public API ────────────────────────────────────────────────────────────────

def run_ai_pipeline(complaint: str, customer_type: str) -> dict[str, Any]:
    """
    Run the full complaint_ai pipeline and return a dict that satisfies
    the backend's ComplaintResponse schema.

    Args:
        complaint:     Raw complaint text from the user.
        customer_type: Customer segment (retail / premium / business).

    Returns:
        A dict with keys:
          category, sentiment, severity, priority, priority_color,
          action, resolution, estimated_resolution_time, confidence_score.
        Always returns a valid dict — falls back to _BRIDGE_FALLBACK on error.
    """
    if _ai_process_complaint is None:
        logger.warning("ai_bridge: AI pipeline unavailable — returning fallback.")
        return _BRIDGE_FALLBACK.copy()

    try:
        # Call the real AI pipeline
        # complaint_ai/main.py::process_complaint(complaint, complaint_id, source)
        ai_result = _ai_process_complaint(complaint, source="backend")

        if not ai_result or "category" not in ai_result:
            raise ValueError(f"AI pipeline returned unexpected result: {ai_result}")

        category   = str(ai_result.get("category", "other")).lower()
        confidence = float(ai_result.get("confidence", 0.0))
        priority   = str(ai_result.get("priority", "MEDIUM")).upper()
        raw_action = str(ai_result.get("action", "HUMAN"))

        # Build resolution: prefer AI's own resolution, fall back to category map
        resolution = str(
            ai_result.get("resolution") or
            _RESOLUTION_BY_CATEGORY.get(category, _RESOLUTION_BY_CATEGORY["other"])
        )

        return {
            "category":                 category,
            "sentiment":                _infer_sentiment(confidence),
            "severity":                 _infer_severity(priority),
            "priority":                 priority,
            "priority_color":           _PRIORITY_COLOR.get(priority, "orange"),
            "action":                   _normalize_action(raw_action),
            "resolution":               resolution,
            "estimated_resolution_time": _PRIORITY_ETA.get(priority, "24 hours"),
            "confidence_score":         round(confidence, 2),
        }

    except Exception as exc:
        logger.error(
            "ai_bridge: Pipeline execution failed — returning fallback. Error: %s",
            exc,
            exc_info=True,
        )
        return _BRIDGE_FALLBACK.copy()
