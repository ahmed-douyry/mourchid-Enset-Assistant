"""Génération de citations structurées."""

from __future__ import annotations

from typing import Any

from app.llm.local_llm import BaseLLM, safe_parse_json
from app.llm.prompts import CITATION_SYSTEM


async def generate_citations(
    llm: BaseLLM,
    draft: str,
    documents: list[dict],
) -> list[dict[str, Any]]:
    passages = "\n".join(
        f"[{i}] {d.get('metadata', {}).get('title','Doc')}: {d.get('text','')[:500]}"
        for i, d in enumerate(documents)
    )
    user = f"Brouillon:\n{draft}\n\nExtraits:\n{passages}"
    raw = await llm.complete(CITATION_SYSTEM, user, temperature=0.0, json_mode=True)
    data = safe_parse_json(raw)
    cites = data.get("citations") or []
    out: list[dict[str, Any]] = []
    for c in cites[:12]:
        if not isinstance(c, dict):
            continue
        out.append(
            {
                "document_title": c.get("document_title"),
                "article_number": c.get("article_number"),
                "source": c.get("source"),
                "excerpt": (c.get("excerpt") or "")[:400],
                "relevance_score": float(c.get("relevance_score") or 0.0),
            },
        )
    return out


def citations_from_docs(documents: list[dict]) -> list[dict[str, Any]]:
    """Fallback déterministe si le LLM échoue."""
    out: list[dict[str, Any]] = []
    for d in documents[:8]:
        meta = d.get("metadata") or {}
        out.append(
            {
                "document_title": meta.get("title"),
                "article_number": str(meta.get("article_number") or ""),
                "source": meta.get("source") or meta.get("url"),
                "excerpt": (d.get("text") or "")[:300],
                "relevance_score": float(d.get("score") or 0.0),
            },
        )
    return out
