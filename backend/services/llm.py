from __future__ import annotations

import json
import os
from typing import Any

import google.generativeai as genai
from dotenv import load_dotenv  # type: ignore[import-not-found]


load_dotenv()

_FALLBACK_RESPONSE: dict[str, str] = {
    "category": "general",
    "sentiment": "neutral",
    "severity": "low",
}


def _build_context_block(context: list[dict[str, Any]]) -> str:
    if not context:
        return "No relevant past complaints were found."

    lines: list[str] = []
    for idx, item in enumerate(context, start=1):
        complaint = str(item.get("complaint", "")).strip()
        resolution = str(item.get("resolution", "")).strip()
        lines.append(f"{idx}. Complaint: {complaint}\n   Resolution: {resolution}")
    return "\n".join(lines)


def _build_prompt(complaint: str, context: list[dict[str, Any]]) -> str:
    context_block = _build_context_block(context)
    return (
        "You are a banking complaint triage assistant.\n"
        "Analyze the complaint using the provided historical context.\n"
        "Return STRICT JSON only with exactly these keys: "
        "category, sentiment, severity.\n"
        "Do not include markdown, code fences, or extra keys.\n\n"
        f"User Complaint:\n{complaint}\n\n"
        f"Retrieved Context:\n{context_block}\n"
    )


def _parse_analysis_response(raw_text: str) -> dict[str, str]:
    parsed = json.loads(raw_text)
    if not isinstance(parsed, dict):
        raise ValueError("Gemini response must be a JSON object.")

    required_keys = ("category", "sentiment", "severity")
    if any(key not in parsed for key in required_keys):
        raise ValueError("Gemini response is missing required keys.")

    return {
        "category": str(parsed["category"]).strip(),
        "sentiment": str(parsed["sentiment"]).strip(),
        "severity": str(parsed["severity"]).strip(),
    }


def analyze_with_llm(complaint: str, context: list[dict[str, Any]]) -> dict[str, str]:
    """Analyze a complaint with Gemini and return structured metadata."""

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = _build_prompt(complaint=complaint, context=context)

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(response_mime_type="application/json"),
    )

    response_text = (response.text or "").strip()

    try:
        return _parse_analysis_response(response_text)
    except (json.JSONDecodeError, ValueError):
        return _FALLBACK_RESPONSE.copy()


class LLMService:
    """Adapter for interacting with Gemini for complaint analysis."""

    async def analyze_with_llm(self, complaint: str, context: list[dict[str, Any]]) -> dict[str, str]:
        return analyze_with_llm(complaint, context)
