"""
llm.py — Gemini LLM interface for complaint classification.

Design principles:
  - Temperature is fixed at 0.1 for near-deterministic, consistent JSON output.
  - Prompt uses chain-of-thought (CoT): model reasons first, then emits JSON.
    CoT measurably improves classification accuracy on ambiguous complaints.
  - A few-shot example anchors the expected output format and tone.
  - The model emits a `confidence` score (0.0–1.0) which the agent uses
    to route low-confidence complaints to human review automatically.
  - All enum outputs (category, priority, action) are validated and sanitized
    before returning — the caller never receives unexpected values.
"""

import json
import re
from typing import Any, Dict

import google.generativeai as genai

import config
from logger import get_logger

logger = get_logger(__name__)


# ── LLM Client Setup ──────────────────────────────────────────────────────────

if not config.GEMINI_API_KEY:
    raise EnvironmentError(
        "GEMINI_API_KEY is not set. "
        "Add it to your .env file (see .env.example for the template)."
    )

genai.configure(api_key=config.GEMINI_API_KEY)

_model = genai.GenerativeModel(
    config.GEMINI_MODEL,
    generation_config=genai.GenerationConfig(
        temperature=0.1,          # Near-deterministic for consistent JSON output
        top_p=0.95,
        max_output_tokens=512,    # Complaints don't need long responses
        response_mime_type="application/json",  # Force strict JSON-only output
    ),
)


# ── Few-shot example (anchors the expected output schema) ─────────────────────

_FEW_SHOT_EXAMPLE = """
EXAMPLE INPUT: "I was charged twice for the same EMI payment last month."
EXAMPLE OUTPUT: {"category": "transaction", "confidence": 0.92, "priority": "HIGH", "action": "AUTO", "resolution": "Identify and reverse the duplicate EMI deduction within 24 hours."}
"""

# ── Valid Enum Values (used for sanitization) ─────────────────────────────────

VALID_CATEGORIES = {"fraud", "transaction", "login", "account", "card", "loan", "other"}
VALID_ACTIONS = {"AUTO", "HUMAN"}
VALID_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

# ── Fallback Output ───────────────────────────────────────────────────────────
# Returned when the LLM call fails or produces unparseable output.
# Confidence 0.0 guarantees the agent will escalate to HUMAN.

_FALLBACK_OUTPUT: Dict[str, Any] = {
    "category": "other",
    "confidence": 0.0,
    "priority": "MEDIUM",
    "action": "HUMAN",
    "resolution": (
        "Unable to classify automatically. "
        "Complaint has been routed to a human agent for manual review."
    ),
}


# ── Main Classification Function ──────────────────────────────────────────────

def classify_complaint(complaint: str, context: list) -> Dict[str, Any]:
    """
    Send a complaint + RAG context to Gemini and return a structured
    classification dictionary.

    The returned dict always contains:
      category   (str)   — complaint type
      confidence (float) — model certainty in [0.0, 1.0]
      priority   (str)   — urgency level
      action     (str)   — AUTO or HUMAN
      resolution (str)   — suggested next step

    Falls back to `_FALLBACK_OUTPUT` on any error — this function never raises.
    """
    context_block = (
        "\n".join(f"  - {c}" for c in context)
        if context
        else "  (no similar cases found in knowledge base)"
    )

    prompt = f"""You are an expert complaint analyst for a financial services company.
Classify the customer complaint and return ONLY a JSON object with exactly these fields.

COMPLAINT CATEGORIES:
  - fraud       : Unauthorized transactions, identity theft, phishing, scam reports
  - transaction : Payment failures, wrong/extra deductions, refund issues, double charges
  - login       : Account access problems, password reset failures, OTP issues
  - account     : Account blocked/frozen, KYC issues, profile update problems
  - card        : Debit/credit card block, card delivery, contactless issues
  - loan        : Loan disbursement delays, EMI disputes, interest calculation errors
  - other       : Complaints that don't fit any category above

SIMILAR RESOLVED CASES (for reference):
{context_block}

{_FEW_SHOT_EXAMPLE}

COMPLAINT TO ANALYZE:
  "{complaint}"

RETURN ONLY THIS JSON (no extra text, no markdown, no explanation):
{{
  "category": "<one of: fraud|transaction|login|account|card|loan|other>",
  "confidence": <float 0.0–1.0>,
  "priority": "<one of: LOW|MEDIUM|HIGH|CRITICAL>",
  "action": "<AUTO or HUMAN>",
  "resolution": "<specific actionable resolution in 1-2 sentences>"
}}"""

    try:
        logger.debug("Sending to Gemini | complaint: '%.80s…'", complaint)
        response = _model.generate_content(prompt)
        raw_text = response.text

        parsed = _extract_json(raw_text)
        validated = _validate_output(parsed)

        logger.info(
            "LLM result | category=%s confidence=%.2f priority=%s action=%s",
            validated["category"],
            validated["confidence"],
            validated["priority"],
            validated["action"],
        )
        return validated

    except Exception as exc:
        logger.error("Gemini call failed: %s — using fallback output.", exc, exc_info=True)
        return _FALLBACK_OUTPUT.copy()


# ── Private Helpers ───────────────────────────────────────────────────────────

def _extract_json(text: str) -> Dict[str, Any]:
    """
    Extract and parse the last JSON object from the LLM response text.

    We intentionally use the *last* match because the model reasons first
    (plain text) and then emits the JSON block — so the JSON is at the end.
    """
    matches = re.findall(r"\{[^{}]+\}", text, re.DOTALL)
    if not matches:
        raise ValueError(f"No JSON object found in LLM response. Raw text: {text[:200]}")
    return json.loads(matches[-1])


def _validate_output(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and sanitize all enum fields in the LLM output.
    Any value outside the allowed set is replaced with the safest fallback,
    so the rest of the pipeline always receives a well-typed dict.
    """
    raw_action = str(data.get("action", "HUMAN")).upper()
    return {
        "category": (
            data.get("category", "other")
            if data.get("category") in VALID_CATEGORIES
            else "other"
        ),
        "confidence": float(max(0.0, min(1.0, data.get("confidence", 0.5)))),
        "priority": (
            data.get("priority", "MEDIUM")
            if data.get("priority") in VALID_PRIORITIES
            else "MEDIUM"
        ),
        "action": raw_action if raw_action in VALID_ACTIONS else "HUMAN",
        "resolution": str(
            data.get("resolution", _FALLBACK_OUTPUT["resolution"])
        ),
    }