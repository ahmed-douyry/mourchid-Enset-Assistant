"""Embeddings open-source via SentenceTransformers (E5-friendly)."""

from __future__ import annotations

import threading
from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.config import Settings, get_settings


class EmbeddingService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._name = settings.embedding_model.lower()
        self._is_e5 = "e5" in self._name
        self._model: SentenceTransformer | None = None
        self._lock = threading.Lock()

    def _load(self) -> SentenceTransformer:
        with self._lock:
            if self._model is None:
                self._model = SentenceTransformer(
                    self._settings.embedding_model,
                    device="cpu",
                )
            return self._model

    def embed_query(self, text: str) -> list[float]:
        m = self._load()
        t = f"query: {text}" if self._is_e5 else text
        vec = m.encode([t], normalize_embeddings=True)[0]
        return vec.tolist()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        m = self._load()
        if self._is_e5:
            texts = [f"passage: {t}" if not t.startswith("passage:") else t for t in texts]
        vecs = m.encode(texts, normalize_embeddings=True)
        return [v.tolist() for v in vecs]

    @property
    def dimension(self) -> int:
        m = self._load()
        return int(m.get_sentence_embedding_dimension())


@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService(get_settings())
