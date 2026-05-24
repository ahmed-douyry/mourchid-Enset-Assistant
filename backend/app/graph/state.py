"""État partagé du graphe LangGraph."""

from __future__ import annotations

import operator
from typing import Annotated, Any

from typing_extensions import TypedDict


class LegalGraphState(TypedDict, total=False):
    user_query: str
    mode: str
    conversation_id: str
    query_type: str
    agent_decision: str
    retrieved_documents: list[dict[str, Any]]
    reranked_documents: list[dict[str, Any]]
    draft_answer: str
    citations: list[dict[str, Any]]
    verification_result: dict[str, Any]
    confidence_score: float
    workflow_trace: Annotated[list[dict[str, Any]], operator.add]
    final_answer: str
    text_a: str
    text_b: str
    context_text: str
    verification_attempts: int


def trace_event(step: str, detail: str = "", payload: dict[str, Any] | None = None) -> dict[str, Any]:
    return {"workflow_trace": [{"step": step, "detail": detail, "payload": payload or {}}]}
