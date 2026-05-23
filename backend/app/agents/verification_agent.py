"""Vérification anti-hallucination."""

from __future__ import annotations

from typing import Any

from app.llm.local_llm import BaseLLM, safe_parse_json
from app.llm.prompts import VERIFICATION_SYSTEM
from app.models.domain import VerificationStatus


def _format_passages(docs: list[dict]) -> str:
    parts: list[str] = []
    for i, d in enumerate(docs, 1):
        parts.append(f"--- {i} ---\n{d.get('text','')}\n")
    return "\n".join(parts)


async def verify_answer(
    llm: BaseLLM,
    draft: str,
    documents: list[dict],
) -> dict[str, Any]:
    if not documents:
        return {
            "status": VerificationStatus.failed.value,
            "confidence": 0.0,
            "explanation": "Aucun document récupéré.",
        }
    passages = _format_passages(documents)
    user = f"RÉPONSE:\n{draft}\n\nEXTRAITS:\n{passages}"
    raw = await llm.complete(VERIFICATION_SYSTEM, user, temperature=0.0, json_mode=True)
    data = safe_parse_json(raw)
    status = data.get("status") or VerificationStatus.partial.value
    if status not in {e.value for e in VerificationStatus}:
        status = VerificationStatus.partial.value
    return {
        "status": status,
        "confidence": float(data.get("confidence") or 0.5),
        "explanation": str(data.get("explanation") or ""),
    }
