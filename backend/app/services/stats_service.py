"""Statistiques simples pour le dashboard."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.config import get_settings


def _path() -> Path:
    p = Path(get_settings().data_dir) / "processed" / "dashboard_stats.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def load_stats() -> dict[str, Any]:
    p = _path()
    if not p.exists():
        return {
            "questions": 0,
            "documents_indexed": 0,
            "domains": {},
            "verified_passed": 0,
            "verified_total": 0,
            "last_queries": [],
        }
    return json.loads(p.read_text(encoding="utf-8"))


def save_stats(data: dict[str, Any]) -> None:
    _path().write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def record_question(query_type: str | None, verified_ok: bool, query_preview: str) -> None:
    s = load_stats()
    s["questions"] = int(s.get("questions", 0)) + 1
    dom = s.get("domains") or {}
    k = query_type or "unknown"
    dom[k] = int(dom.get(k, 0)) + 1
    s["domains"] = dom
    s["verified_total"] = int(s.get("verified_total", 0)) + 1
    if verified_ok:
        s["verified_passed"] = int(s.get("verified_passed", 0)) + 1
    last = s.get("last_queries") or []
    last.insert(0, {"query": query_preview[:200], "type": k})
    s["last_queries"] = last[:20]
    save_stats(s)


def set_documents_count(n: int) -> None:
    s = load_stats()
    s["documents_indexed"] = n
    save_stats(s)
