"""Retriever sémantique + filtres métadonnées."""

from __future__ import annotations

from typing import Any

from app.config import get_settings
from app.rag.embeddings import get_embedding_service
from app.rag.reranker import get_reranker
from app.rag.vector_store import SearchHit, get_vector_store


class LegalRetriever:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._emb = get_embedding_service()
        self._store = get_vector_store(self._settings, self._emb)
        self._reranker = get_reranker()

    def retrieve(
        self,
        query: str,
        *,
        top_k: int = 12,
        metadata_filter: dict[str, Any] | None = None,
    ) -> list[SearchHit]:
        self._store.ensure_collection(self._emb.dimension)
        qv = self._emb.embed_query(query)
        hits = self._store.search(qv, limit=top_k, metadata_filter=metadata_filter)
        if self._reranker.enabled():
            hits = self._reranker.rerank(query, hits, top_n=min(8, top_k))
        return hits


def get_retriever() -> LegalRetriever:
    return LegalRetriever()
