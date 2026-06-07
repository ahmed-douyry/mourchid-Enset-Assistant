"""Persistance des traces de workflow."""

from __future__ import annotations

import json
import logging
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.config import get_settings

logger = logging.getLogger(__name__)


def traces_dir() -> Path:
    p = get_settings().resolved_data_dir / "processed" / "traces"
    p.mkdir(parents=True, exist_ok=True)
    return p


def save_trace(conversation_id: str, trace: list[dict[str, Any]], full_state: dict[str, Any]) -> None:
    tid = conversation_id or str(uuid.uuid4())
    payload = {
        "conversationId": tid,
        "savedAt": datetime.now(UTC).isoformat(),
        "workflowTrace": trace,
        "state": full_state,
    }
    fp = traces_dir() / f"{tid}.json"
    fp.write_text(json.dumps(payload, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    logger.info("Trace workflow sauvegardée : %s (%d étapes)", tid, len(trace))


def load_trace(conversation_id: str) -> dict[str, Any] | None:
    fp = traces_dir() / f"{conversation_id}.json"
    if not fp.exists():
        return None
    return json.loads(fp.read_text(encoding="utf-8"))


def list_traces(limit: int = 30) -> list[dict[str, Any]]:
    """Liste les traces récentes (conversationId, date, aperçu requête)."""
    root = traces_dir()
    items: list[dict[str, Any]] = []
    for fp in root.glob("*.json"):
        try:
            data = json.loads(fp.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        state = data.get("state") or {}
        items.append(
            {
                "conversationId": data.get("conversationId") or fp.stem,
                "savedAt": data.get("savedAt"),
                "queryPreview": str(state.get("user_query") or "")[:120],
                "queryType": state.get("query_type"),
                "stepCount": len(data.get("workflowTrace") or []),
                "updatedAt": fp.stat().st_mtime,
            },
        )
    items.sort(key=lambda x: float(x.get("updatedAt") or 0), reverse=True)
    return items[: max(1, limit)]
