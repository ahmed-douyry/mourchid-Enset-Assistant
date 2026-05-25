"""Routes quiz."""

from fastapi import APIRouter, HTTPException

from app.models.schemas import QuizRequest, QuizResponse
from app.services import quiz_service

router = APIRouter(tags=["quiz"])


@router.post("/quiz", response_model=QuizResponse, response_model_by_alias=True)
async def post_quiz(body: QuizRequest) -> QuizResponse:
    try:
        return await quiz_service.run_quiz(body)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
