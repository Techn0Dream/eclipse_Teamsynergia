"""
api.py — FastAPI application for the Complaint AI system.

Endpoints:
  POST /complaint — Submit a complaint for AI classification and routing.
  GET  /health    — Liveness check for load balancers and monitoring tools.

Design decisions:
  - Input is validated (min/max length) with a Pydantic field validator before
    touching the agent pipeline — invalid requests are rejected with HTTP 422.
  - Each request gets a UUID that flows through to MongoDB for full traceability.
  - Responses are typed with ComplaintResponse so clients always get a
    predictable, documented shape.
  - Errors surface as proper HTTP exceptions (4xx/5xx), never silent 200s.
  - CORS is open for demo/hackathon. Restrict `allow_origins` in production.
"""

import uuid
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

from logger import get_logger
from main import process_complaint

logger = get_logger(__name__)


# ── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="Complaint AI",
    description=(
        "AI-powered complaint classification and routing system. "
        "Uses LangGraph + FAISS (RAG) + Gemini to classify, prioritize, "
        "and suggest resolutions for customer complaints."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow all origins for demo use. In production, replace ["*"] with your
# frontend domain(s), e.g. ["https://your-dashboard.com"].

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Request Model ─────────────────────────────────────────────────────────────

class ComplaintRequest(BaseModel):
    """Input schema for a complaint submission."""

    complaint: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="The full text of the customer complaint.",
        examples=["Money was deducted from my account but not received by the beneficiary."],
    )

    @field_validator("complaint")
    @classmethod
    def strip_and_validate(cls, v: str) -> str:
        """Strip leading/trailing whitespace before min_length is checked."""
        stripped = v.strip()
        if len(stripped) < 10:
            raise ValueError("Complaint must be at least 10 characters after trimming.")
        return stripped


# ── Response Model ────────────────────────────────────────────────────────────

class ComplaintResponse(BaseModel):
    """Output schema returned to the client after classification."""

    complaint_id: str = Field(
        ...,
        description="Unique UUID for this complaint. Use it for status lookups.",
    )
    category: str = Field(..., description="Classified complaint type.")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence (0–1).")
    priority: str = Field(..., description="Urgency level: LOW | MEDIUM | HIGH | CRITICAL.")
    action: str = Field(..., description="Routing decision: AUTO | HUMAN.")
    resolution: str = Field(..., description="Suggested resolution or next step.")
    status: str = Field(default="open", description="Current workflow status.")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post(
    "/complaint",
    response_model=ComplaintResponse,
    summary="Submit a new complaint",
    tags=["Complaints"],
    status_code=200,
)
async def handle_complaint(request: Request, body: ComplaintRequest) -> ComplaintResponse:
    """
    Run the full AI pipeline on a customer complaint:
    RAG retrieval → Gemini classification → Decision rules → MongoDB persistence.

    Returns a structured result with priority, routing action, and resolution.
    """
    complaint_id = str(uuid.uuid4())
    logger.info(
        "Incoming complaint | id=%s | text='%.60s…'",
        complaint_id,
        body.complaint,
    )

    result = process_complaint(body.complaint, complaint_id=complaint_id)

    if result is None or "category" not in result:
        logger.error("Pipeline returned invalid result | id=%s", complaint_id)
        raise HTTPException(
            status_code=500,
            detail="The complaint could not be processed. Please try again later.",
        )

    response = ComplaintResponse(
        complaint_id=complaint_id,
        category=result["category"],
        confidence=result.get("confidence", 0.0),
        priority=result["priority"],
        action=result["action"],
        resolution=result["resolution"],
        status="open",
    )

    logger.info(
        "Complaint processed | id=%s category=%s priority=%s action=%s confidence=%.2f",
        complaint_id,
        response.category,
        response.priority,
        response.action,
        response.confidence,
    )
    return response


@app.get(
    "/health",
    summary="Liveness check",
    tags=["System"],
)
async def health_check():
    """
    Liveness probe for load balancers and uptime monitors.
    Returns HTTP 200 with service version if the application is running.
    """
    return {"status": "ok", "version": "1.0.0"}


# ── Global Error Handler ──────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all handler that converts unhandled exceptions to a safe 500 response."""
    logger.error(
        "Unhandled exception | method=%s path=%s error=%s",
        request.method,
        request.url.path,
        exc,
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please contact support."},
    )