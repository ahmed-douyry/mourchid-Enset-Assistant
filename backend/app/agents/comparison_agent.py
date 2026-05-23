"""Comparaison de deux textes."""

from __future__ import annotations

from typing import Any

from app.llm.local_llm import BaseLLM, safe_parse_json
from app.llm.prompts import COMPARISON_SYSTEM


async def compare_texts(llm: BaseLLM, text_a: str, text_b: str) -> dict[str, Any]:
    user = f"TEXTE A:\n{text_a[:12000]}\n\nTEXTE B:\n{text_b[:12000]}"
    raw = await llm.complete(COMPARISON_SYSTEM, user, temperature=0.2, json_mode=True)
    data = safe_parse_json(raw)
    return {
        "main_differences": str(data.get("main_differences") or ""),
        "added_obligations": str(data.get("added_obligations") or ""),
        "removed_obligations": str(data.get("removed_obligations") or ""),
        "practical_impact": str(data.get("practical_impact") or ""),
    }
