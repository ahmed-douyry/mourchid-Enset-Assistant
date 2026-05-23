"""Agent superviseur — classification d'intention."""

from __future__ import annotations

import json
from typing import Any

from app.llm.local_llm import BaseLLM, safe_parse_json
from app.llm.prompts import CLASSIFY_SYSTEM
from app.models.domain import QueryType


def _heuristic_classify(message: str, text_a: str | None, text_b: str | None) -> dict[str, Any]:
    m = message.lower()
    if text_a and text_b and len(text_a) > 30 and len(text_b) > 30:
        return {
            "query_type": QueryType.comparison.value,
            "agent_decision": "comparison",
            "reason": "deux textes fournis",
        }
    if any(k in m for k in ("résum", "resum", "synthèse", "synthese")):
        return {"query_type": QueryType.summary.value, "agent_decision": "summary", "reason": "mots-clés"}
    if any(
        k in m
        for k in (
            "étape",
            "demarche",
            "démarche",
            "document",
            "dossier",
            "inscription",
            "inscrire",
            "réinscription",
            "reinscription",
            "bourse",
            "attestation",
            "équivalence",
            "equivalence",
            "candidature",
            "stage",
            "convention",
            "procédure",
            "procedure",
        )
    ):
        return {"query_type": QueryType.procedure.value, "agent_decision": "procedure", "reason": "mots-clés"}
    if any(
        k in m
        for k in (
            "filière",
            "filiere",
            "module",
            "master",
            "licence",
            "ingénieur",
            "ingenieur",
            "concours",
            "débouché",
            "debouche",
            "enset",
            "semestre",
            "formation",
            "cours",
        )
    ):
        return {
            "query_type": QueryType.legal_question.value,
            "agent_decision": "academic",
            "reason": "mots-clés",
        }
    if any(k in m for k in ("météo", "weather", "football", "recipe", "python")):
        return {
            "query_type": QueryType.out_of_scope.value,
            "agent_decision": "none",
            "reason": "hors domaine heuristique",
        }
    return {
        "query_type": QueryType.legal_question.value,
        "agent_decision": "academic",
        "reason": "défaut",
    }


async def classify_intent(
    llm: BaseLLM,
    message: str,
    *,
    text_a: str | None = None,
    text_b: str | None = None,
) -> dict[str, Any]:
    user = f"Message utilisateur:\n{message}\n"
    if text_a and text_b:
        user += "\nDeux textes fournis pour comparaison (présence indiquée).\n"
    try:
        raw = await llm.complete(CLASSIFY_SYSTEM, user, temperature=0.0, json_mode=True)
        data = safe_parse_json(raw)
        qt = data.get("query_type")
        if qt in {e.value for e in QueryType}:
            return {
                "query_type": qt,
                "agent_decision": data.get("agent_decision", qt),
                "reason": data.get("reason", ""),
            }
    except Exception:
        pass
    return _heuristic_classify(message, text_a, text_b)
