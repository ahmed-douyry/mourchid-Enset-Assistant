"""Indexation : fichiers → chunks → embeddings → vector store."""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any

from app.config import Settings, get_settings
from app.rag.chunker import chunk_text
from app.rag.document_loader import load_text_file
from app.rag.embeddings import EmbeddingService, get_embedding_service
from app.rag.pdf_loader import extract_pdf_text
from app.rag.vector_store import get_vector_store


def _registry_path(settings: Settings) -> Path:
    return settings.resolved_data_dir / "processed" / "documents_registry.json"


def load_registry(settings: Settings) -> dict[str, Any]:
    p = _registry_path(settings)
    if not p.exists():
        return {"documents": {}}
    return json.loads(p.read_text(encoding="utf-8"))


def save_registry(settings: Settings, data: dict[str, Any]) -> None:
    p = _registry_path(settings)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def index_file(
    file_path: Path,
    *,
    document_id: str | None = None,
    extra_metadata: dict[str, Any] | None = None,
    settings: Settings | None = None,
) -> tuple[str, int]:
    """Indexe un fichier (pdf, md, txt). Retourne (document_id, chunk_count)."""
    s = settings or get_settings()
    emb = get_embedding_service()
    store = get_vector_store(s, emb)
    store.ensure_collection(emb.dimension)

    doc_id = document_id or str(uuid.uuid4())
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        text = extract_pdf_text(file_path)
    else:
        text = load_text_file(file_path)

    base_meta: dict[str, Any] = {
        "document_id": doc_id,
        "filename": file_path.name,
        "country": "Morocco",
        "language": "fr",
        "source": str(file_path.name),
        "title": file_path.stem,
    }
    if extra_metadata:
        base_meta.update(extra_metadata)

    chunks = chunk_text(text)
    if not chunks:
        return doc_id, 0

    ids: list[str] = []
    vectors: list[list[float]] = []
    payloads: list[dict[str, Any]] = []

    for i, ch in enumerate(chunks):
        cid = str(uuid.uuid4())
        ids.append(cid)
        meta = {**base_meta, "chunk_index": i, "text": ch}
        payloads.append(meta)

    vectors = emb.embed_documents([p["text"] for p in payloads])
    store.upsert(ids, vectors, payloads)

    reg = load_registry(s)
    reg.setdefault("documents", {})[doc_id] = {
        "filename": file_path.name,
        "path": str(file_path),
        "chunk_count": len(chunks),
        "metadata": {k: v for k, v in base_meta.items() if k != "text"},
        "status": "indexed",
    }
    save_registry(s, reg)
    return doc_id, len(chunks)


def delete_vectors_by_document_id(document_id: str, settings: Settings | None = None) -> None:
    """Supprime uniquement les vecteurs (réindexation)."""
    s = settings or get_settings()
    store = get_vector_store(s, get_embedding_service())
    store.delete_by_document_id(document_id)


def delete_document(document_id: str, settings: Settings | None = None) -> None:
    s = settings or get_settings()
    store = get_vector_store(s, get_embedding_service())
    store.delete_by_document_id(document_id)
    reg = load_registry(s)
    if document_id in reg.get("documents", {}):
        del reg["documents"][document_id]
        save_registry(s, reg)
