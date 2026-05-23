"""Agent retriever — pont vers le retriever RAG."""

from __future__ import annotations

from typing import Any

from app.rag.retriever import LegalRetriever, get_retriever


def hits_to_docs(hits: list[Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for h in hits:
        out.append(
            {
                "id": h.id,
                "text": h.text,
                "score": h.score,
                "metadata": dict(h.metadata),
            },
        )
    return out


def retrieve_for_query(
    query: str,
    *,
    domain: str | None = None,
    retriever: LegalRetriever | None = None,
) -> list[dict[str, Any]]:
    r = retriever or get_retriever()
    flt: dict[str, Any] | None = None
    if domain:
        flt = {"domain": domain}
    hits = r.retrieve(query, top_k=12, metadata_filter=flt)
    return hits_to_docs(hits)
