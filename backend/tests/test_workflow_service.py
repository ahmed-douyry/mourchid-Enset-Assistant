import json

import pytest

from app.services import workflow_service


@pytest.fixture
def traces_tmp(monkeypatch, tmp_path):
    data_root = tmp_path / "data"
    monkeypatch.setenv("DATA_DIR", str(data_root))
    from app.config import get_settings

    get_settings.cache_clear()
    yield data_root
    get_settings.cache_clear()


def test_saveAndLoadTrace(traces_tmp):
    trace = [{"step": "classifyQuery", "detail": "test", "payload": {"query_type": "procedure"}}]
    state = {"user_query": "Comment déposer une bourse ?", "query_type": "procedure"}
    workflow_service.save_trace("conv-abc", trace, state)

    loaded = workflow_service.load_trace("conv-abc")
    assert loaded is not None
    assert loaded["conversationId"] == "conv-abc"
    assert len(loaded["workflowTrace"]) == 1

    fp = workflow_service.traces_dir() / "conv-abc.json"
    assert fp.exists()
    assert json.loads(fp.read_text(encoding="utf-8"))["state"]["user_query"] == state["user_query"]


def test_listTracesReturnsRecentFirst(traces_tmp):
    workflow_service.save_trace("conv-1", [{"step": "finalResponse"}], {"user_query": "Question A"})
    workflow_service.save_trace("conv-2", [{"step": "finalResponse"}], {"user_query": "Question B"})

    items = workflow_service.list_traces()
    ids = [i["conversationId"] for i in items]
    assert "conv-1" in ids
    assert "conv-2" in ids
    assert items[0]["queryPreview"]
