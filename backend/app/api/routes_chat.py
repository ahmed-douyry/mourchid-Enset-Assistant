"""Routes chat."""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.models.schemas import ChatRequest, ChatResponse
from app.services import chat_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse, response_model_by_alias=True)
async def post_chat(body: ChatRequest) -> ChatResponse:
    try:
        return await chat_service.run_chat(body)
    except Exception as e:
        logger.exception("POST /api/chat failed")
        raise HTTPException(status_code=503, detail=str(e)) from e


@router.post("/chat/stream")
async def post_chat_stream(body: ChatRequest) -> StreamingResponse:
    """Stream SSE : phases agents puis tokens de la réponse."""
    return StreamingResponse(
        chat_service.stream_chat_events(body),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
