"""Abstraction vector store — Qdrant (défaut) ou ChromaDB."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

from qdrant_client import QdrantClient
from qdrant_client.http import models as qm

from app.config import Settings, get_settings
from app.rag.embeddings import EmbeddingService, get_embedding_service


@dataclass
class SearchHit:
    id: str
    text: str
    score: float
    metadata: dict[str, Any]


class VectorStore(Protocol):
    def ensure_collection(self, dim: int) -> None: ...
    def upsert(
        self,
        ids: list[str],
        vectors: list[list[float]],
        payloads: list[dict[str, Any]],
    ) -> None: ...
    def search(
        self,
        vector: list[float],
        limit: int,
        metadata_filter: dict[str, Any] | None,
    ) -> list[SearchHit]: ...
    def delete_by_document_id(self, document_id: str) -> None: ...


class QdrantVectorStore:
    def __init__(self, settings: Settings, embeddings: EmbeddingService) -> None:
        self._settings = settings
        self._emb = embeddings
        self._client = QdrantClient(url=settings.qdrant_url)
        self._collection = settings.qdrant_collection

    def ensure_collection(self, dim: int) -> None:
        cols = self._client.get_collections().collections
        names = {c.name for c in cols}
        if self._collection in names:
            return
        self._client.create_collection(
            collection_name=self._collection,
            vectors_config=qm.VectorParams(size=dim, distance=qm.Distance.COSINE),
        )

    def upsert(
        self,
        ids: list[str],
        vectors: list[list[float]],
        payloads: list[dict[str, Any]],
    ) -> None:
        points = [
            qm.PointStruct(id=pid, vector=vec, payload=pay)
            for pid, vec, pay in zip(ids, vectors, payloads)
        ]
        self._client.upsert(collection_name=self._collection, points=points)

    def _build_filter(self, metadata_filter: dict[str, Any] | None) -> qm.Filter | None:
        if not metadata_filter:
            return None
        must: list[qm.FieldCondition] = []
        for k, v in metadata_filter.items():
            if isinstance(v, (str, int, float, bool)):
                must.append(
                    qm.FieldCondition(key=k, match=qm.MatchValue(value=v)),
                )
        return qm.Filter(must=must) if must else None

    def search(
        self,
        vector: list[float],
        limit: int,
        metadata_filter: dict[str, Any] | None,
    ) -> list[SearchHit]:
        flt = self._build_filter(metadata_filter)
        qres = self._client.query_points(
            collection_name=self._collection,
            query=vector,
            limit=limit,
            query_filter=flt,
            with_payload=True,
        )
        res = qres.points
        hits: list[SearchHit] = []
        for r in res:
            payload = r.payload or {}
            text = str(payload.get("text", ""))
            meta = {k: v for k, v in payload.items() if k != "text"}
            hits.append(
                SearchHit(id=str(r.id), text=text, score=float(r.score), metadata=meta),
            )
        return hits

    def delete_by_document_id(self, document_id: str) -> None:
        cols = self._client.get_collections().collections
        if self._collection not in {c.name for c in cols}:
            return
        self._client.delete(
            collection_name=self._collection,
            points_selector=qm.FilterSelector(
                filter=qm.Filter(
                    must=[
                        qm.FieldCondition(
                            key="document_id",
                            match=qm.MatchValue(value=document_id),
                        ),
                    ],
                ),
            ),
        )


class ChromaVectorStore:
    """Chroma persistant — alternative locale."""

    def __init__(self, settings: Settings, embeddings: EmbeddingService) -> None:
        import chromadb

        self._settings = settings
        self._emb = embeddings
        path = settings.chroma_path
        self._client = chromadb.PersistentClient(path=path)
        self._collection = self._client.get_or_create_collection(
            name=settings.qdrant_collection,
            metadata={"hnsw:space": "cosine"},
        )

    def ensure_collection(self, dim: int) -> None:
        return

    def upsert(
        self,
        ids: list[str],
        vectors: list[list[float]],
        payloads: list[dict[str, Any]],
    ) -> None:
        documents = [p.get("text", "") for p in payloads]
        metadatas: list[dict[str, Any]] = []
        for p in payloads:
            meta = {k: v for k, v in p.items() if k != "text" and isinstance(v, (str, int, float, bool))}
            metadatas.append(meta)
        self._collection.upsert(ids=ids, embeddings=vectors, documents=documents, metadatas=metadatas)

    def search(
        self,
        vector: list[float],
        limit: int,
        metadata_filter: dict[str, Any] | None,
    ) -> list[SearchHit]:
        where = metadata_filter or None
        res = self._collection.query(
            query_embeddings=[vector],
            n_results=limit,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
        hits: list[SearchHit] = []
        ids = (res.get("ids") or [[]])[0]
        docs = (res.get("documents") or [[]])[0]
        metas = (res.get("metadatas") or [[]])[0]
        dists = (res.get("distances") or [[]])[0]
        for i, pid in enumerate(ids):
            score = 1.0 - float(dists[i]) if i < len(dists) else 0.0
            meta = dict(metas[i]) if i < len(metas) else {}
            text = docs[i] if i < len(docs) else ""
            hits.append(SearchHit(id=str(pid), text=text or "", score=score, metadata=meta))
        return hits

    def delete_by_document_id(self, document_id: str) -> None:
        data = self._collection.get(where={"document_id": document_id})
        ids = data.get("ids") or []
        if ids:
            self._collection.delete(ids=ids)


def get_vector_store(
    settings: Settings | None = None,
    embeddings: EmbeddingService | None = None,
) -> VectorStore:
    s = settings or get_settings()
    e = embeddings or get_embedding_service()
    if s.vector_db == "chroma":
        return ChromaVectorStore(s, e)
    return QdrantVectorStore(s, e)
