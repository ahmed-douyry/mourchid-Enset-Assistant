"""Conditions de routage pour LangGraph."""

from __future__ import annotations

from typing import Literal

from app.graph.state import LegalGraphState


def after_classify(state: LegalGraphState) -> Literal["out", "continue"]:
    if state.get("query_type") == "out_of_scope":
        return "out"
    return "continue"


def route_specialized(state: LegalGraphState) -> str:
    qt = state.get("query_type") or "legal_question"
    if qt == "procedure":
        return "procedure"
    if qt == "summary":
        return "summary"
    if qt == "comparison":
        return "comparison"
    return "academic"


def after_verify(state: LegalGraphState) -> Literal["end"]:
    return "end"
