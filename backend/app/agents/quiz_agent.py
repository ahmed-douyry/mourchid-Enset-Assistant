"""Génération de quiz via LLM."""

from __future__ import annotations

from typing import Any

from app.llm.local_llm import BaseLLM, safe_parse_json
from app.llm.prompts import QUIZ_SYSTEM


async def generate_quiz(
    llm: BaseLLM,
    filiere: str,
    count: int = 5,
    difficulty: str = "moyen",
) -> list[dict[str, Any]]:
    user = (
        f"Filière: {filiere}\n"
        f"Nombre de questions: {count}\n"
        f"Difficulté: {difficulty}\n"
        "Génère un nouveau quiz original."
    )
    # Température élevée pour varier le quiz à chaque appel.
    raw = await llm.complete(QUIZ_SYSTEM, user, temperature=0.9, json_mode=True)
    data = safe_parse_json(raw)
    questions = data.get("questions") or []
    return list(questions) if isinstance(questions, list) else []
