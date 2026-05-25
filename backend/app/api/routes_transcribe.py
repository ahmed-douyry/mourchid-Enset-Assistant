"""Route transcription audio."""

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services import transcription_service

router = APIRouter(tags=["transcribe"])

_MAX_BYTES = 25 * 1024 * 1024


@router.post("/transcribe")
async def post_transcribe(file: UploadFile = File(...)) -> dict[str, str]:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Fichier audio vide.")
    if len(content) > _MAX_BYTES:
        raise HTTPException(status_code=413, detail="Fichier audio trop volumineux (max 25 Mo).")
    try:
        text = await transcription_service.transcribe_audio(content, file.filename or "audio.webm")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Transcription impossible : {e}") from e
    return {"text": text}
