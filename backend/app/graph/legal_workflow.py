"""Construction et export du graphe LangGraph (LangGraph Studio)."""

from __future__ import annotations

from langgraph.graph import END, StateGraph

from app.graph import nodes
from app.graph.conditions import after_classify, route_specialized
from app.graph.state import LegalGraphState


def build_graph():
    g = StateGraph(LegalGraphState)

    g.add_node("classifyQuery", nodes.classify_query)
    g.add_node("retrieveDocuments", nodes.retrieve_documents)
    g.add_node("rerankDocuments", nodes.rerank_documents)
    g.add_node("routeToSpecializedAgent", nodes.route_to_specialized_agent)
    g.add_node("academicAnswer", nodes.legal_reasoning)
    g.add_node("procedureAnalysis", nodes.procedure_analysis)
    g.add_node("summaryAnalysis", nodes.summary_analysis)
    g.add_node("comparisonAnalysis", nodes.comparison_analysis)
    g.add_node("citationGeneration", nodes.citation_generation)
    g.add_node("verification", nodes.verification)
    g.add_node("finalResponse", nodes.final_response)

    try:
        from langgraph.graph import START

        g.add_edge(START, "classifyQuery")
    except (ImportError, AttributeError):  # pragma: no cover
        g.set_entry_point("classifyQuery")
    g.add_conditional_edges(
        "classifyQuery",
        after_classify,
        {"out": "finalResponse", "continue": "retrieveDocuments"},
    )
    g.add_edge("retrieveDocuments", "rerankDocuments")
    g.add_edge("rerankDocuments", "routeToSpecializedAgent")
    g.add_conditional_edges(
        "routeToSpecializedAgent",
        route_specialized,
        {
            "procedure": "procedureAnalysis",
            "academic": "academicAnswer",
            "summary": "summaryAnalysis",
            "comparison": "comparisonAnalysis",
        },
    )
    g.add_edge("procedureAnalysis", "citationGeneration")
    g.add_edge("academicAnswer", "citationGeneration")
    g.add_edge("summaryAnalysis", "citationGeneration")
    g.add_edge("comparisonAnalysis", "citationGeneration")
    g.add_edge("citationGeneration", "verification")
    g.add_edge("verification", "finalResponse")
    g.add_edge("finalResponse", END)

    return g.compile()


graph = build_graph()
