"""Service chat — orchestration LangGraph."""

from __future__ import annotations

import asyncio
import json
import re
import uuid
from collections.abc import AsyncIterator
from typing import Any

from app.config import get_settings
from app.graph.legal_workflow import graph
from app.mcp.tools import check_official_source
from app.models.schemas import ChatRequest, ChatResponse, CitationItem, WorkflowTraceItem
from app.services import stats_service, workflow_service

PHASES: list[tuple[str, str]] = [
    ("analyze", "Analyse de votre question…"),
    ("search", "Recherche dans les documents indexés…"),
    ("agents", "Coordination des agents…"),
    ("verify", "Vérification des sources…"),
    ("synth", "Synthèse de la réponse…"),
]


def _map_citations(raw: list[dict[str, Any]]) -> list[CitationItem]:
    out: list[CitationItem] = []
    for c in raw:
        src = c.get("source")
        hint = None
        if isinstance(src, str) and src.startswith("http"):
            hint = str(check_official_source(src).get("reason") or "")
        out.append(
            CitationItem(
                document_title=c.get("document_title"),
                article_number=c.get("article_number"),
                source=src,
                excerpt=c.get("excerpt"),
                relevance_score=c.get("relevance_score"),
                official_hint=hint,
            ),
        )
    return out


def _map_trace(raw: list[dict[str, Any]]) -> list[WorkflowTraceItem]:
    items: list[WorkflowTraceItem] = []
    for t in raw:
        items.append(
            WorkflowTraceItem(
                step=str(t.get("step", "")),
                detail=t.get("detail"),
                payload=t.get("payload"),
            ),
        )
    return items


async def run_chat(body: ChatRequest) -> ChatResponse:
    settings = get_settings()
    conv = body.conversation_id or str(uuid.uuid4())
    initial: dict[str, Any] = {
        "user_query": body.message,
        "mode": body.mode,
        "conversation_id": conv,
        "workflow_trace": [],
        "text_a": body.text_a,
        "text_b": body.text_b,
        "context_text": body.context_text,
    }
    result = await graph.ainvoke(initial)
    trace = result.get("workflow_trace") or []
    workflow_service.save_trace(conv, trace, {k: v for k, v in result.items() if k != "workflow_trace"})

    vr = result.get("verification_result") or {}
    verified_ok = vr.get("status") != "failed"
    stats_service.record_question(result.get("query_type"), verified_ok, body.message)

    citations = _map_citations(result.get("citations") or [])
    return ChatResponse(
        answer=result.get("final_answer") or "",
        query_type=str(result.get("query_type") or "legal_question"),
        citations=citations,
        confidence_score=float(result.get("confidence_score") or 0.0),
        workflow_trace=_map_trace(trace),
        llm_model=settings.llm_model,
        conversation_id=conv,
    )


def _chunk_answer(text: str) -> list[str]:
    """Découpe la réponse en morceaux pour un effet typewriter naturel."""
    if not text:
        return []
    parts = re.split(r"(\s+)", text)
    chunks: list[str] = []
    buf = ""
    for p in parts:
        buf += p
        if len(buf) >= 4 or (buf and p.endswith(("\n", ".", "!", "?", ":", ";"))):
            chunks.append(buf)
            buf = ""
    if buf:
        chunks.append(buf)
    return chunks


async def stream_chat_events(body: ChatRequest) -> AsyncIterator[str]:
    """SSE : phases multi-agent puis streaming token par token de la réponse."""
    task = asyncio.create_task(run_chat(body))
    phase_idx = 0

    try:
        while not task.done():
            if phase_idx < len(PHASES):
                pid, label = PHASES[phase_idx]
                yield f"data: {json.dumps({'type': 'phase', 'phase': pid, 'label': label}, ensure_ascii=False)}\n\n"
                phase_idx += 1
            await asyncio.sleep(1.6)

        result = await task
        answer = result.answer or ""

        yield f"data: {json.dumps({'type': 'stream_start'}, ensure_ascii=False)}\n\n"

        for chunk in _chunk_answer(answer):
            yield f"data: {json.dumps({'type': 'token', 'content': chunk}, ensure_ascii=False)}\n\n"
            await asyncio.sleep(0.028)

        payload = result.model_dump(mode="json", by_alias=True)
        yield f"data: {json.dumps({'type': 'done', 'data': payload}, ensure_ascii=False)}\n\n"
    except Exception as e:
        if not task.done():
            task.cancel()
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)}, ensure_ascii=False)}\n\n"
