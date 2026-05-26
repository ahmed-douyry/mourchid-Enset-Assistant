import pytest

from app.agents.retriever_agent import hits_to_docs


class _Hit:
    def __init__(self) -> None:
        self.id = "1"
        self.text = "x"
        self.score = 0.5
        self.metadata = {"domain": "demo"}


def test_retrieverAgent_hitsToDocs_mapsFields():
    docs = hits_to_docs([_Hit()])
    assert docs[0]["id"] == "1"
    assert docs[0]["text"] == "x"
