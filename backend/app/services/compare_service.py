"""Service comparaison."""

from __future__ import annotations

from app.agents import comparison_agent
from app.llm.local_llm import get_llm
from app.models.schemas import CompareRequest, CompareResponse


async def run_compare(body: CompareRequest) -> CompareResponse:
    llm = get_llm()
    data = await comparison_agent.compare_texts(llm, body.text_a, body.text_b)
    return CompareResponse(
        main_differences=data.get("main_differences", ""),
        added_obligations=data.get("added_obligations", ""),
        removed_obligations=data.get("removed_obligations", ""),
        practical_impact=data.get("practical_impact", ""),
    )
