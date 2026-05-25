"""Persistance des traces de workflow."""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any

from app.config import get_settings


def traces_dir() -> Path:
    p = Path(get_settings().data_dir) / "processed" / "traces"
    p.mkdir(parents=True, exist_ok=True)
    return p


def save_trace(conversation_id: str, trace: list[dict[str, Any]], full_state: dict[str, Any]) -> None:
    tid = conversation_id or str(uuid.uuid4())
    payload = {"conversationId": tid, "workflowTrace": trace, "state": full_state}
    fp = traces_dir() / f"{tid}.json"
    fp.write_text(json.dumps(payload, ensure_ascii=False, indent=2, default=str), encoding="utf-8")


def load_trace(conversation_id: str) -> dict[str, Any] | None:
    fp = traces_dir() / f"{conversation_id}.json"
    if not fp.exists():
        return None
    return json.loads(fp.read_text(encoding="utf-8"))
