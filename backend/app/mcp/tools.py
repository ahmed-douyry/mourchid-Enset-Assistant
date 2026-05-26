"""Outils MCP / utilitaires réutilisables par les agents ou le serveur MCP."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from app.rag.retriever import get_retriever


def search_legal_corpus(query: str, top_k: int = 8) -> list[dict[str, Any]]:
    r = get_retriever()
    hits = r.retrieve(query, top_k=top_k, metadata_filter=None)
    return [
        {
            "id": h.id,
            "text": h.text,
            "score": h.score,
            "metadata": h.metadata,
        }
        for h in hits
    ]


def extract_pdf_text(file_path: str) -> str:
    from app.rag.pdf_loader import extract_pdf_text as _ext

    return _ext(Path(file_path))


def check_official_source(url: str | None) -> dict[str, Any]:
    if not url:
        return {"official": False, "reason": "URL absente"}
    u = url.lower()
    official_domains = (
        ".gov.ma",
        "service-public.ma",
        "legifrance",  # non Maroc mais indicateur
        "justice.gov.ma",
    )
    if any(d in u for d in (".gov.ma", "service-public.ma")):
        return {"official": True, "reason": "Domaine administratif probable (heuristique)"}
    if u.startswith("http") and "gov" in u:
        return {"official": True, "reason": "Indicateur gouvernemental faible"}
    return {"official": False, "reason": "Source non reconnue comme officielle"}


def generate_procedure_checklist(answer: str) -> list[dict[str, Any]]:
    """Découpe grossière en étapes à partir de lignes numérotées ou tirets."""
    lines = [ln.strip() for ln in answer.splitlines() if ln.strip()]
    steps: list[dict[str, Any]] = []
    for i, ln in enumerate(lines[:40], 1):
        if re.match(r"^(\d+[\).]|-|\*)", ln):
            steps.append(
                {
                    "step": len(steps) + 1,
                    "label": re.sub(r"^(\d+[\).]|-|\*)\s*", "", ln)[:500],
                    "done": False,
                },
            )
    if not steps:
        for i, ln in enumerate(lines[:15], 1):
            steps.append({"step": i, "label": ln[:400], "done": False})
    return steps


def compare_legal_texts(text_a: str, text_b: str) -> dict[str, str]:
    """Comparaison déterministe minimale (longueur / phrases) — le LLM reste la référence métier."""
    return {
        "len_a": str(len(text_a)),
        "len_b": str(len(text_b)),
        "note": "Utilisez l'agent LLM pour une analyse juridique.",
    }


def extract_document_metadata(text: str) -> dict[str, Any]:
    """Heuristique simple sur le début du texte."""
    head = text[:2000]
    meta: dict[str, Any] = {"language_guess": "fr" if re.search(r"[a-zA-Zàâçéèêëîïôùûü]", head) else "unknown"}
    if "article" in head.lower():
        m = re.search(r"article\s+([0-9]+)", head, re.I)
        if m:
            meta["article_number"] = m.group(1)
    if "dahir" in head.lower():
        meta["document_type"] = "dahir"
    elif "décret" in head.lower() or "decret" in head.lower():
        meta["document_type"] = "décret"
    elif "loi" in head.lower():
        meta["document_type"] = "loi"
    return meta
