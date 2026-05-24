"""Nœuds du graphe — délégation aux agents."""

from __future__ import annotations

import asyncio
from typing import Any

from app.agents import citation_agent, comparison_agent, legal_reasoning_agent, procedure_agent, summary_agent, supervisor_agent, verification_agent
from app.agents.retriever_agent import retrieve_for_query
from app.graph.state import LegalGraphState, trace_event
from app.llm.local_llm import get_llm
from app.llm.prompts import INSUFFICIENT_SOURCES_REPLY, OUT_OF_SCOPE_REPLY
from app.models.domain import VerificationStatus


async def classify_query(state: LegalGraphState) -> dict[str, Any]:
    llm = get_llm()
    res = await supervisor_agent.classify_intent(
        llm,
        state["user_query"],
        text_a=state.get("text_a"),
        text_b=state.get("text_b"),
    )
    out: dict[str, Any] = {
        "query_type": res["query_type"],
        "agent_decision": str(res.get("agent_decision", "")),
        "verification_attempts": int(state.get("verification_attempts") or 0),
    }
    out.update(
        trace_event(
            "classifyQuery",
            res.get("reason", ""),
            {"query_type": res["query_type"]},
        ),
    )
    return out


async def retrieve_documents(state: LegalGraphState) -> dict[str, Any]:
    # Qdrant + embeddings sont synchrones : éviter BlockingError dans LangGraph Studio / asyncio.
    docs = await asyncio.to_thread(retrieve_for_query, state["user_query"])
    out: dict[str, Any] = {"retrieved_documents": docs}
    out.update(
        trace_event(
            "retrieveDocuments",
            f"{len(docs)} passages",
            {"top_scores": [float(d.get("score") or 0) for d in docs[:3]]},
        ),
    )
    return out


async def rerank_documents(state: LegalGraphState) -> dict[str, Any]:
    docs = state.get("retrieved_documents") or []
    out: dict[str, Any] = {"reranked_documents": docs}
    out.update(trace_event("rerankDocuments", "Rerank / ordre final", {"count": len(docs)}))
    return out


async def route_to_specialized_agent(state: LegalGraphState) -> dict[str, Any]:
    return trace_event(
        "routeToSpecializedAgent",
        state.get("agent_decision", ""),
        {"query_type": state.get("query_type")},
    )


async def legal_reasoning(state: LegalGraphState) -> dict[str, Any]:
    llm = get_llm()
    docs = state.get("reranked_documents") or []
    if not docs:
        text = INSUFFICIENT_SOURCES_REPLY
    else:
        text = await legal_reasoning_agent.run_legal_reasoning(
            llm,
            state["user_query"],
            docs,
            state.get("mode", "detailed"),
        )
    out: dict[str, Any] = {"draft_answer": text}
    out.update(trace_event("academicAnswer", "", {"chars": len(text)}))
    return out


async def procedure_analysis(state: LegalGraphState) -> dict[str, Any]:
    llm = get_llm()
    docs = state.get("reranked_documents") or []
    if not docs:
        text = INSUFFICIENT_SOURCES_REPLY
    else:
        text = await procedure_agent.run_procedure_analysis(
            llm,
            state["user_query"],
            docs,
            state.get("mode", "procedure"),
        )
    out: dict[str, Any] = {"draft_answer": text}
    out.update(trace_event("procedureAnalysis", "", {"chars": len(text)}))
    return out


async def summary_analysis(state: LegalGraphState) -> dict[str, Any]:
    llm = get_llm()
    body = state.get("context_text") or ""
    if not body.strip():
        docs = state.get("reranked_documents") or []
        body = "\n\n".join(d.get("text", "") for d in docs[:6])
    if not body.strip():
        text = INSUFFICIENT_SOURCES_REPLY
    else:
        data = await summary_agent.summarize_text(llm, body)
        text = data.get("summary") or INSUFFICIENT_SOURCES_REPLY
    out: dict[str, Any] = {"draft_answer": text}
    out.update(trace_event("summaryAnalysis", "", {}))
    return out


async def comparison_analysis(state: LegalGraphState) -> dict[str, Any]:
    llm = get_llm()
    a = state.get("text_a") or ""
    b = state.get("text_b") or ""
    if len(a) < 20 or len(b) < 20:
        text = (
            "Pour comparer deux textes, fournissez `text_a` et `text_b` suffisamment longs "
            "ou utilisez la page Comparaison."
        )
    else:
        data = await comparison_agent.compare_texts(llm, a, b)
        text = "\n\n".join(
            [
                f"Différences principales : {data.get('main_differences','')}",
                f"Conditions / atouts en plus : {data.get('added_obligations','')}",
                f"Conditions / points en moins : {data.get('removed_obligations','')}",
                f"Impact pour l'étudiant : {data.get('practical_impact','')}",
            ],
        )
    out: dict[str, Any] = {"draft_answer": text}
    out.update(trace_event("comparisonAnalysis", "", {}))
    return out


async def citation_generation(state: LegalGraphState) -> dict[str, Any]:
    llm = get_llm()
    docs = state.get("reranked_documents") or []
    draft = state.get("draft_answer") or ""
    cites: list[dict[str, Any]] = []
    if docs and draft and INSUFFICIENT_SOURCES_REPLY not in draft:
        cites = await citation_agent.generate_citations(llm, draft, docs)
        if not cites:
            cites = citation_agent.citations_from_docs(docs)
    elif docs:
        cites = citation_agent.citations_from_docs(docs)
    out: dict[str, Any] = {"citations": cites}
    out.update(trace_event("citationGeneration", f"{len(cites)} citations", {}))
    return out


async def verification(state: LegalGraphState) -> dict[str, Any]:
    llm = get_llm()
    docs = state.get("reranked_documents") or []
    draft = state.get("draft_answer") or ""
    if not docs:
        vr = {
            "status": VerificationStatus.failed.value,
            "confidence": 0.0,
            "explanation": "Aucun document récupéré.",
        }
    else:
        vr = await verification_agent.verify_answer(llm, draft, docs)
    scores = [float(d.get("score") or 0) for d in docs]
    base = sum(scores) / len(scores) if scores else 0.0
    conf = 0.45 * base + 0.55 * float(vr.get("confidence") or 0.0)
    conf = max(0.0, min(1.0, conf))
    out: dict[str, Any] = {
        "verification_result": vr,
        "confidence_score": conf,
    }
    out.update(trace_event("verification", str(vr.get("status")), {"confidence": conf}))
    return out


async def final_response(state: LegalGraphState) -> dict[str, Any]:
    qt = state.get("query_type")
    if qt == "out_of_scope":
        answer = OUT_OF_SCOPE_REPLY
    else:
        vr = state.get("verification_result") or {}
        if vr.get("status") == "failed":
            answer = INSUFFICIENT_SOURCES_REPLY
        else:
            answer = state.get("draft_answer") or INSUFFICIENT_SOURCES_REPLY
    out: dict[str, Any] = {"final_answer": answer}
    out.update(trace_event("finalResponse", "", {"length": len(answer)}))
    return out
