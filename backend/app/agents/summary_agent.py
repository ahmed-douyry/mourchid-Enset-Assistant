"""Résumé juridique simplifié."""

from __future__ import annotations

from typing import Any

from app.llm.local_llm import BaseLLM, safe_parse_json
from app.llm.prompts import SUMMARY_SYSTEM


async def summarize_text(llm: BaseLLM, text: str) -> dict[str, Any]:
    user = f"Texte:\n{text[:24000]}"
    raw = await llm.complete(SUMMARY_SYSTEM, user, temperature=0.2, json_mode=True)
    data = safe_parse_json(raw)
    return {
        "summary": str(data.get("summary") or ""),
        "key_points": list(data.get("key_points") or []),
        "obligations": list(data.get("obligations") or []),
        "risks": list(data.get("risks") or []),
        "key_articles": list(data.get("key_articles") or []),
    }
