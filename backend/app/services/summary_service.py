"""Service résumé."""

from __future__ import annotations

from app.agents import summary_agent
from app.llm.local_llm import get_llm
from app.models.schemas import SummarizeRequest, SummarizeResponse


async def run_summary(body: SummarizeRequest) -> SummarizeResponse:
    llm = get_llm()
    data = await summary_agent.summarize_text(llm, body.text)
    return SummarizeResponse(
        summary=data.get("summary", ""),
        key_points=list(data.get("key_points") or []),
        obligations=list(data.get("obligations") or []),
        risks=list(data.get("risks") or []),
        key_articles=list(data.get("key_articles") or []),
    )
