"""
agent.py — LangGraph pipeline for complaint processing.

Pipeline: retrieve → llm → decide

  Node 1 (retrieve): Fetches semantically similar resolved complaints via RAG.
  Node 2 (llm):      Classifies the complaint using Gemini with CoT prompting.
  Node 3 (decide):   Applies business rules on top of LLM output:
                       - Priority is the higher of LLM-suggested or category baseline.
                       - Low-confidence complaints are always escalated to HUMAN.
                       - Fraud and CRITICAL priority always require a human agent.

The `app` object at the bottom is the compiled LangGraph and is imported
by main.py to run the pipeline.
"""

from typing import Any, Dict, List, TypedDict

from langgraph.graph import StateGraph

import config
from llm import classify_complaint
from logger import get_logger
from rag import retrieve_context

logger = get_logger(__name__)


# ── Agent State ───────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    """
    Shared state threaded through all LangGraph nodes.
    Each node receives the full state and returns a partial update dict.
    LangGraph merges partial updates into the state automatically.
    """

    complaint: str          # Raw complaint text from the user
    context: List[str]      # RAG-retrieved similar cases (set by retrieve_node)
    llm_output: Dict        # Parsed + validated LLM classification (set by llm_node)
    result: Dict[str, Any]  # Final enriched result (set by decision_node)


# ── Priority Map ──────────────────────────────────────────────────────────────
# Maps category → minimum priority baseline. The decision node uses the
# higher of this baseline and whatever priority the LLM suggested.

_CATEGORY_PRIORITY_MAP: Dict[str, str] = {
    "fraud":       "CRITICAL",
    "transaction": "HIGH",
    "card":        "HIGH",
    "loan":        "MEDIUM",
    "account":     "MEDIUM",
    "login":       "MEDIUM",
    "other":       "LOW",
}

_PRIORITY_ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]


# ── Node 1: Retrieve ──────────────────────────────────────────────────────────

def retrieve_node(state: AgentState) -> Dict:
    """
    RAG node — fetches the top-k most similar resolved complaints.
    The returned context strings are injected into the LLM prompt to
    improve classification accuracy through few-shot grounding.
    """
    logger.info("RAG retrieval | complaint: '%.60s…'", state["complaint"])
    context = retrieve_context(state["complaint"])
    return {"context": context}


# ── Node 2: LLM ───────────────────────────────────────────────────────────────

def llm_node(state: AgentState) -> Dict:
    """
    LLM node — sends the complaint + RAG context to Gemini for classification.
    Returns a validated dict with: category, confidence, priority, action, resolution.
    Falls back gracefully if Gemini is unavailable.
    """
    llm_output = classify_complaint(state["complaint"], state["context"])
    return {"llm_output": llm_output}


# ── Node 3: Decision Engine ───────────────────────────────────────────────────

def decision_node(state: AgentState) -> Dict:
    """
    Decision node — enriches the LLM output with business rules.

    Rule 1 — Category-based priority baseline:
      Each category has a minimum priority. The final priority is the
      higher of the LLM's suggestion and this baseline.

    Rule 2 — Confidence-based escalation:
      If the LLM's confidence < LOW_CONFIDENCE_THRESHOLD, override action
      to HUMAN regardless of what the model suggested.

    Rule 3 — Fraud / CRITICAL always goes to human:
      These complaints carry legal and financial risk — no auto-resolution.
    """
    data = state["llm_output"]
    category = data.get("category", "other")
    confidence = data.get("confidence", 0.0)
    llm_priority = data.get("priority", "MEDIUM")
    action = data.get("action", "HUMAN")

    # Rule 1 — Use the higher of: LLM priority vs. category baseline
    baseline_priority = _CATEGORY_PRIORITY_MAP.get(category, "LOW")
    final_priority = (
        llm_priority
        if _PRIORITY_ORDER.index(llm_priority) >= _PRIORITY_ORDER.index(baseline_priority)
        else baseline_priority
    )

    # Rule 2 — Low confidence → escalate to human
    if confidence < config.LOW_CONFIDENCE_THRESHOLD:
        action = "HUMAN"
        logger.warning(
            "Low confidence (%.2f < %.2f) for category=%s — escalating to HUMAN.",
            confidence,
            config.LOW_CONFIDENCE_THRESHOLD,
            category,
        )

    # Rule 3 — Fraud or CRITICAL always needs a human agent
    if category == "fraud" or final_priority == "CRITICAL":
        action = "HUMAN"
        logger.info(
            "Forcing HUMAN action | category=%s priority=%s",
            category,
            final_priority,
        )

    result = {
        "category": category,
        "confidence": round(confidence, 3),
        "priority": final_priority,
        "action": action,
        "resolution": data.get("resolution", "Manual review required."),
    }

    logger.info(
        "Decision complete | category=%s priority=%s action=%s confidence=%.2f",
        result["category"],
        result["priority"],
        result["action"],
        result["confidence"],
    )
    return {"result": result}


# ── LangGraph Pipeline ────────────────────────────────────────────────────────

graph = StateGraph(AgentState)

graph.add_node("retrieve", retrieve_node)
graph.add_node("llm", llm_node)
graph.add_node("decide", decision_node)

graph.set_entry_point("retrieve")
graph.add_edge("retrieve", "llm")
graph.add_edge("llm", "decide")

# `app` is imported by main.py and invoked per request
app = graph.compile()