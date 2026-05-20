"""Découpage de texte en chunks avec recouvrement."""

from __future__ import annotations


def chunk_text(
    text: str,
    *,
    chunk_size: int = 900,
    chunk_overlap: int = 120,
) -> list[str]:
    text = text.strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        piece = text[start:end]
        chunks.append(piece.strip())
        if end == len(text):
            break
        start = max(0, end - chunk_overlap)
    return [c for c in chunks if c]
