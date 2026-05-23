"""Raisonnement juridique à partir des extraits."""

from __future__ import annotations

from app.llm.local_llm import BaseLLM
from app.llm.prompts import LEGAL_REASONING_SYSTEM


def _format_passages(docs: list[dict]) -> str:
    parts: list[str] = []
    for i, d in enumerate(docs, 1):
        meta = d.get("metadata") or {}
        title = meta.get("title") or meta.get("source") or "Document"
        parts.append(f"--- Extrait {i} : {title} ---\n{d.get('text','')}\n")
    return "\n".join(parts)


async def run_legal_reasoning(
    llm: BaseLLM,
    user_query: str,
    documents: list[dict],
    mode: str,
) -> str:
    passages = _format_passages(documents)
    user = f"Question:\n{user_query}\n\nNiveau de réponse demandé: {mode}\n\nExtraits:\n{passages}"
    return await llm.complete(LEGAL_REASONING_SYSTEM, user, temperature=0.2)
