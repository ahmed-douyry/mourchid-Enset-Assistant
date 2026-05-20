"""Chargement de documents texte / markdown."""

from __future__ import annotations

from pathlib import Path


def load_text_file(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")
