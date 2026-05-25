"""Routes résumé."""

from fastapi import APIRouter, HTTPException

from app.models.schemas import SummarizeRequest, SummarizeResponse
from app.services import summary_service

router = APIRouter(tags=["summary"])


@router.post("/summarize", response_model=SummarizeResponse)
async def post_summarize(body: SummarizeRequest) -> SummarizeResponse:
    try:
        return await summary_service.run_summary(body)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
