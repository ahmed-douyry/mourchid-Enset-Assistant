"""Reranking optionnel (cross-encoder open-source)."""

from __future__ import annotations

import threading
from typing import TYPE_CHECKING

from app.config import Settings, get_settings

if TYPE_CHECKING:
    from app.rag.vector_store import SearchHit


class RerankerService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._model = None
        self._lock = threading.Lock()

    def enabled(self) -> bool:
        return bool(self._settings.reranker_enabled)

    def _load(self):
        if self._model is None:
            from sentence_transformers import CrossEncoder

            with self._lock:
                if self._model is None:
                    self._model = CrossEncoder(self._settings.reranker_model)
        return self._model

    def rerank(self, query: str, hits: list["SearchHit"], top_n: int) -> list["SearchHit"]:
        if not self.enabled() or not hits:
            return hits[:top_n]
        model = self._load()
        pairs = [[query, h.text] for h in hits]
        scores = model.predict(pairs)
        scored = sorted(zip(scores, hits), key=lambda x: x[0], reverse=True)
        out: list[SearchHit] = []
        for sc, h in scored[:top_n]:
            out.append(
                SearchHit(
                    id=h.id,
                    text=h.text,
                    score=float(sc),
                    metadata=h.metadata,
                ),
            )
        return out


def get_reranker() -> RerankerService:
    return RerankerService(get_settings())
