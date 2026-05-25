"""Transcription audio via Whisper (transformers, local)."""

from __future__ import annotations

import tempfile
from functools import lru_cache
from typing import Any

from app.config import get_settings


@lru_cache(maxsize=1)
def _get_pipeline() -> Any:
    """Charge le pipeline ASR Whisper une seule fois (téléchargé au 1er appel)."""
    import torch
    from transformers import pipeline

    settings = get_settings()
    device = 0 if torch.cuda.is_available() else -1
    return pipeline(
        "automatic-speech-recognition",
        model=settings.whisper_model,
        device=device,
        chunk_length_s=30,
    )


async def transcribe_audio(content: bytes, filename: str) -> str:
    settings = get_settings()
    suffix = "." + filename.rsplit(".", 1)[-1] if "." in filename else ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as tmp:
        tmp.write(content)
        tmp.flush()
        asr = _get_pipeline()
        result = asr(
            tmp.name,
            generate_kwargs={"language": settings.whisper_language, "task": "transcribe"},
        )
    text = result.get("text", "") if isinstance(result, dict) else str(result)
    return text.strip()
