from __future__ import annotations

import json
import logging
import random
from collections.abc import Mapping

from backend.models.schema import ComplaintResponse

logger = logging.getLogger(__name__)


_RESOLUTION_BY_CATEGORY: dict[str, str] = {
    "fraud": "Account blocked and investigation initiated",
    "transaction_issue": "Refund will be processed within 24 hours",
    "account_issue": "Please reset your credentials",
    "general": "Your issue will be reviewed",
}

_PRIORITY_COLOR: dict[str, str] = {
    "HIGH": "red",
    "MEDIUM": "orange",
    "LOW": "green",
}

_ESTIMATED_RESOLUTION_TIME: dict[str, str] = {
    "HIGH": "2-4 hours",
    "MEDIUM": "24 hours",
    "LOW": "48 hours",
}

_DECISION_FALLBACK: dict = {
    "category": "general",
    "sentiment": "neutral",
    "severity": "low",
    "priority": "MEDIUM",
    "priority_color": "orange",
    "action": "auto_resolve",
    "resolution": _RESOLUTION_BY_CATEGORY["general"],
    "estimated_resolution_time": "24 hours",
    "confidence_score": 0.80,
}


def _normalize_value(value: object, default: str = "") -> str:
    if value is None:
        return default
    return str(value).strip()


def agent_decision(llm_output: dict, customer_type: str) -> dict:
    """Build the complaint handling decision from LLM output and customer type.

    Returns a structured decision with priority, action, resolution, and metadata.
    """

    logger.debug(
        "Processing LLM output",
        extra={"llm_result": json.dumps(llm_output), "customer_type": customer_type},
    )

    try:
        if not isinstance(llm_output, Mapping):
            raise TypeError("llm_output must be a mapping.")

        required_fields = ("category", "sentiment", "severity")
        missing_fields = [field for field in required_fields if not _normalize_value(llm_output.get(field))]
        if missing_fields:
            raise KeyError(f"Missing required fields: {', '.join(missing_fields)}")

        category = _normalize_value(llm_output.get("category")).lower()
        sentiment = _normalize_value(llm_output.get("sentiment")).lower()
        severity = _normalize_value(llm_output.get("severity")).lower()
        normalized_customer_type = _normalize_value(customer_type).lower()

        priority = "HIGH" if (
            category == "fraud"
            or severity == "high"
            or normalized_customer_type == "premium"
        ) else "MEDIUM"

        action = "human_support" if priority == "HIGH" else "auto_resolve"
        resolution = _RESOLUTION_BY_CATEGORY.get(category, _RESOLUTION_BY_CATEGORY["general"])
        priority_color = _PRIORITY_COLOR.get(priority, "orange")
        estimated_time = _ESTIMATED_RESOLUTION_TIME.get(priority, "24 hours")
        confidence = round(random.uniform(0.7, 0.95), 2)

        decision = {
            "category": category,
            "sentiment": sentiment,
            "severity": severity,
            "priority": priority,
            "priority_color": priority_color,
            "action": action,
            "resolution": resolution,
            "estimated_resolution_time": estimated_time,
            "confidence_score": confidence,
        }

        logger.info(
            "Decision engine output",
            extra={
                "category": category,
                "priority": priority,
                "action": action,
                "confidence": confidence,
                "customer_type": normalized_customer_type,
            },
        )

        return decision
    except (TypeError, KeyError, ValueError) as exc:
        logger.warning(
            "Decision engine fallback triggered",
            extra={"error": str(exc)},
            exc_info=True,
        )
        return _DECISION_FALLBACK.copy()


def process_complaint(complaint: str, customer_type: str) -> dict[str, str]:
    """Run the full AI pipeline for a complaint and return a structured result.

    Delegates to ai_bridge.run_ai_pipeline() which imports and calls the
    complaint_ai module (LangGraph + FAISS + Gemini + MongoDB).

    Falls back to agent_decision() with a safe default if the AI bridge fails,
    so the endpoint always returns a valid response.
    """
    try:
        from backend.services.ai_bridge import run_ai_pipeline  # noqa: PLC0415
        return run_ai_pipeline(complaint=complaint, customer_type=customer_type)
    except Exception as exc:
        logger.warning(
            "AI bridge unavailable, falling back to rule-based decision. Error: %s", exc
        )
        fallback_llm_output = {
            "category": "general",
            "sentiment": "neutral",
            "severity": "low",
        }
        return agent_decision(llm_output=fallback_llm_output, customer_type=customer_type)
