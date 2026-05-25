"""Gestion des documents (upload, liste, indexation)."""

from __future__ import annotations

import uuid
from pathlib import Path
from typing import Any

from app.config import get_settings
from app.models.schemas import DocumentItem
from app.rag.indexer import delete_document, delete_vectors_by_document_id, index_file, load_registry, save_registry
from app.services import stats_service


def raw_dir() -> Path:
    p = Path(get_settings().data_dir) / "raw"
    p.mkdir(parents=True, exist_ok=True)
    return p


async def save_upload(filename: str, data: bytes) -> tuple[str, str]:
    doc_id = str(uuid.uuid4())
    safe_name = Path(filename).name
    dest = raw_dir() / f"{doc_id}_{safe_name}"
    dest.write_bytes(data)
    reg = load_registry(get_settings())
    reg.setdefault("documents", {})[doc_id] = {
        "filename": safe_name,
        "path": str(dest),
        "chunk_count": 0,
        "metadata": {},
        "status": "uploaded",
    }
    save_registry(get_settings(), reg)
    return doc_id, safe_name


def list_documents() -> list[DocumentItem]:
    s = get_settings()
    reg = load_registry(s)
    out: list[DocumentItem] = []
    for doc_id, info in reg.get("documents", {}).items():
        out.append(
            DocumentItem(
                document_id=doc_id,
                filename=str(info.get("filename", "")),
                status=str(info.get("status", "")),
                metadata=dict(info.get("metadata") or {}),
                chunk_count=int(info.get("chunk_count") or 0),
            ),
        )
    return out


async def index_documents(document_ids: list[str] | None, reindex_all: bool) -> dict[str, Any]:
    s = get_settings()
    reg = load_registry(s)
    docs = reg.get("documents", {})
    ids = list(docs.keys()) if reindex_all else (document_ids or [])
    indexed = 0
    for did in ids:
        info = docs.get(did)
        if not info:
            continue
        path = Path(info.get("path", ""))
        if not path.exists():
            continue
        delete_vectors_by_document_id(did, s)
        meta = dict(info.get("metadata") or {})
        _, chunks = index_file(path, document_id=did, extra_metadata=meta, settings=s)
        reg = load_registry(s)
        if did in reg.get("documents", {}):
            reg["documents"][did]["chunk_count"] = chunks
            reg["documents"][did]["status"] = "indexed"
            save_registry(s, reg)
        indexed += 1
    stats_service.set_documents_count(len(load_registry(s).get("documents", {})))
    return {"indexed": indexed}


async def remove_document(document_id: str) -> None:
    s = get_settings()
    reg = load_registry(s)
    info = reg.get("documents", {}).get(document_id)
    path = Path(str(info.get("path", ""))) if info else None
    if path and path.exists():
        path.unlink()
    delete_document(document_id, s)
