"""Serveur MCP stdio (FastMCP). Exécution : `cd backend && python -m app.mcp.server`."""

from __future__ import annotations

import json

try:
    from mcp.server.fastmcp import FastMCP
except ImportError as e:  # pragma: no cover
    raise SystemExit(
        "Le package 'mcp' est requis. Installez les dépendances : `cd backend && uv sync --group dev` (ou `uv sync`).",
    ) from e

from app.mcp import tools as T

mcp = FastMCP("legaldoc-assistant")


@mcp.tool()
def searchLegalCorpus(query: str, top_k: int = 8) -> str:
    """Recherche sémantique dans le corpus indexé."""
    return json.dumps(T.search_legal_corpus(query, top_k), ensure_ascii=False)


@mcp.tool()
def extractPdfText(filePath: str) -> str:
    """Extrait le texte d'un PDF local."""
    return T.extract_pdf_text(filePath)


@mcp.tool()
def checkOfficialSource(url: str) -> str:
    """Vérifie heuristiquement si une URL semble officielle."""
    return json.dumps(T.check_official_source(url), ensure_ascii=False)


@mcp.tool()
def generateProcedureChecklist(answer: str) -> str:
    """Transforme une procédure en checklist."""
    return json.dumps(T.generate_procedure_checklist(answer), ensure_ascii=False)


@mcp.tool()
def compareLegalTexts(textA: str, textB: str) -> str:
    """Comparaison rapide (métadonnées) entre deux textes."""
    return json.dumps(T.compare_legal_texts(textA, textB), ensure_ascii=False)


@mcp.tool()
def extractDocumentMetadata(text: str) -> str:
    """Extrait des métadonnées heuristiques d'un texte."""
    return json.dumps(T.extract_document_metadata(text), ensure_ascii=False)


def main() -> None:
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
