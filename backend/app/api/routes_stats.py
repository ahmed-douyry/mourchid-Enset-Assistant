"""Statistiques agrégées pour le dashboard."""

from fastapi import APIRouter

from app.config import get_settings
from app.rag.indexer import load_registry
from app.services.stats_service import load_stats

router = APIRouter(tags=["stats"])


@router.get("/stats/dashboard")
async def dashboard_stats() -> dict:
    s = get_settings()
    stats = load_stats()
    reg = load_registry(s)
    n_docs = len(reg.get("documents", {}))
    verified_total = int(stats.get("verified_total") or 0)
    verified_passed = int(stats.get("verified_passed") or 0)
    rate = (verified_passed / verified_total) if verified_total else 0.0
    return {
        "documentsIndexed": n_docs,
        "questionsAsked": int(stats.get("questions", 0)),
        "topDomains": stats.get("domains") or {},
        "verifiedRate": round(rate, 3),
        "lastQueries": stats.get("last_queries") or [],
        "llmModel": s.llm_model,
        "vectorDb": s.vector_db,
        "embeddingModel": s.embedding_model,
    }
