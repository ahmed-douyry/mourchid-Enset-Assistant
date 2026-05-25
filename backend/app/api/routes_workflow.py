"""Routes workflow / traces."""

from fastapi import APIRouter, HTTPException

from app.services import workflow_service

router = APIRouter(tags=["workflow"])


@router.get("/workflow/trace/{conversation_id}")
async def get_workflow_trace(conversation_id: str) -> dict:
    data = workflow_service.load_trace(conversation_id)
    if not data:
        raise HTTPException(status_code=404, detail="Trace introuvable")
    return data
