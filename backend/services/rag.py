from __future__ import annotations

import re
from typing import TypedDict


class ComplaintContext(TypedDict):
    complaint: str
    resolution: str


# In-memory baseline context store. This can be replaced with a vector DB later.
PAST_COMPLAINTS: list[ComplaintContext] = [
    {
        "complaint": "money deducted but not received",
        "resolution": "refund processed within 24 hours",
    },
    {
        "complaint": "unauthorized transaction",
        "resolution": "account blocked and investigation started",
    },
    {
        "complaint": "login issue",
        "resolution": "password reset required",
    },
]


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def retrieve_context(complaint: str) -> list[ComplaintContext]:
    """Return the top 2 keyword-matched complaint-resolution pairs."""

    query_tokens = _tokenize(complaint)
    if not query_tokens:
        return []

    scored_matches: list[tuple[int, ComplaintContext]] = []
    for item in PAST_COMPLAINTS:
        candidate_tokens = _tokenize(item["complaint"])
        overlap_score = len(query_tokens.intersection(candidate_tokens))
        if overlap_score > 0:
            scored_matches.append((overlap_score, item))

    scored_matches.sort(key=lambda match: match[0], reverse=True)
    return [item for _, item in scored_matches[:2]]


class RAGService:
    """Retrieval layer abstraction for complaint context lookup."""

    async def retrieve_context(self, complaint: str) -> list[ComplaintContext]:
        return retrieve_context(complaint)
