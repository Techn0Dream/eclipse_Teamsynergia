import logging

from fastapi import APIRouter, HTTPException, status

from backend.models.schema import ComplaintRequest, ComplaintResponse
from backend.services.agent import process_complaint

router = APIRouter(tags=["complaints"])
logger = logging.getLogger(__name__)


@router.post("/process-complaint", response_model=ComplaintResponse, response_model_exclude_none=True)
async def submit_complaint(payload: ComplaintRequest) -> ComplaintResponse:
    logger.info(
        "Incoming complaint",
        extra={
            "complaint_length": len(payload.complaint),
            "customer_type": payload.customer_type,
        },
    )
    try:
        result = process_complaint(payload.complaint, payload.customer_type)
        logger.info(
            "Complaint processing decision made",
            extra={
                "category": result.get("category"),
                "priority": result.get("priority"),
                "action": result.get("action"),
                "confidence_score": result.get("confidence_score"),
            },
        )
        return ComplaintResponse(**result)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error while processing complaint")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while processing the complaint.",
        ) from exc
