"""Domain types (internal, not API DTOs)."""

from __future__ import annotations

from enum import Enum
from typing import Any


class QueryType(str, Enum):
    legal_question = "legal_question"
    procedure = "procedure"
    summary = "summary"
    comparison = "comparison"
    out_of_scope = "out_of_scope"
    obligations = "obligations"
    compliance_check = "compliance_check"


class VerificationStatus(str, Enum):
    passed = "passed"
    failed = "failed"
    partial = "partial"


class RetrievedChunk:
    """Single chunk from vector store."""

    def __init__(
        self,
        id: str,
        text: str,
        score: float,
        metadata: dict[str, Any],
    ) -> None:
        self.id = id
        self.text = text
        self.score = score
        self.metadata = metadata

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "text": self.text,
            "score": self.score,
            "metadata": self.metadata,
        }
