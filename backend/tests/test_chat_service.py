import pytest

from app.models.schemas import ChatRequest
from app.services import chat_service
import app.services.workflow_service as workflow_service_mod
import app.services.stats_service as stats_service_mod


class _FakeGraph:
    async def ainvoke(self, state: dict):
        return {
            "final_answer": "Réponse démo.",
            "query_type": "procedure",
            "citations": [],
            "confidence_score": 0.81,
            "workflow_trace": [{"step": "finalResponse", "detail": "", "payload": {}}],
            "verification_result": {"status": "passed", "confidence": 0.9, "explanation": "ok"},
        }


@pytest.mark.asyncio
async def test_chatService_returnsOkWithMockedGraph(monkeypatch):
    monkeypatch.setattr(chat_service, "graph", _FakeGraph())
    monkeypatch.setattr(workflow_service_mod, "save_trace", lambda *a, **k: None)
    monkeypatch.setattr(stats_service_mod, "record_question", lambda *a, **k: None)

    res = await chat_service.run_chat(ChatRequest(message="Comment renouveler ma CIN ?"))
    assert res.answer
    assert res.query_type == "procedure"
    assert res.confidence_score >= 0.8
