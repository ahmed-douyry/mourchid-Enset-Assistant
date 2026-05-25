"""Routes comparaison."""

from fastapi import APIRouter, HTTPException

from app.models.schemas import CompareRequest, CompareResponse
from app.services import compare_service

router = APIRouter(tags=["compare"])


@router.post("/compare", response_model=CompareResponse)
async def post_compare(body: CompareRequest) -> CompareResponse:
    try:
        return await compare_service.run_compare(body)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
