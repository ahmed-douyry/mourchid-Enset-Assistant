"""Analyse de procédures administratives."""

from __future__ import annotations

from app.llm.local_llm import BaseLLM
from app.llm.prompts import PROCEDURE_SYSTEM


def _format_passages(docs: list[dict]) -> str:
    parts: list[str] = []
    for i, d in enumerate(docs, 1):
        meta = d.get("metadata") or {}
        title = meta.get("title") or "Document"
        parts.append(f"--- Extrait {i} : {title} ---\n{d.get('text','')}\n")
    return "\n".join(parts)


async def run_procedure_analysis(
    llm: BaseLLM,
    user_query: str,
    documents: list[dict],
    mode: str,
) -> str:
    passages = _format_passages(documents)
    user = f"Demande utilisateur:\n{user_query}\n\nMode: {mode}\n\nExtraits:\n{passages}"
    return await llm.complete(PROCEDURE_SYSTEM, user, temperature=0.2)
