"""Point d'entrée FastAPI."""

from __future__ import annotations

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient

from app.api import (
    routes_chat,
    routes_compare,
    routes_documents,
    routes_quiz,
    routes_stats,
    routes_summary,
    routes_transcribe,
    routes_workflow,
)
from app.config import get_settings
from app.models.schemas import HealthResponse

app = FastAPI(title="Mourchid — Assistant académique ENSET", version="0.1.0")

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_chat.router, prefix="/api")
app.include_router(routes_documents.router, prefix="/api")
app.include_router(routes_workflow.router, prefix="/api")
app.include_router(routes_compare.router, prefix="/api")
app.include_router(routes_summary.router, prefix="/api")
app.include_router(routes_stats.router, prefix="/api")
app.include_router(routes_quiz.router, prefix="/api")
app.include_router(routes_transcribe.router, prefix="/api")


@app.get("/api/health", response_model=HealthResponse, response_model_by_alias=True)
async def health() -> HealthResponse:
    s = get_settings()
    llm_label = "ollama" if s.llm_provider == "ollama" else "llamacpp"
    try:
        async with httpx.AsyncClient(timeout=2.0, headers=s.ollama_request_headers()) as c:
            r = await c.get(f"{s.ollama_api_http_root()}/api/tags")
            r.raise_for_status()
    except Exception:
        llm_label = f"{llm_label} (unreachable)"

    vdb = s.vector_db
    if vdb == "qdrant":
        try:
            QdrantClient(url=s.qdrant_url).get_collections()
        except Exception:
            vdb = f"{vdb} (unreachable)"

    return HealthResponse(
        status="ok",
        llm=llm_label,
        vector_db=vdb,
        embedding_model=s.embedding_model,
    )
