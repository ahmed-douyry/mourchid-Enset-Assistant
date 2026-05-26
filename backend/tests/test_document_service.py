import pytest

from app.config import get_settings
from app.services import document_service


@pytest.mark.asyncio
async def test_documentService_saveAndList(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_DIR", str(tmp_path / "data"))
    get_settings.cache_clear()
    try:
        doc_id, name = await document_service.save_upload("test.txt", b"hello corpus")
        items = document_service.list_documents()
        assert any(d.document_id == doc_id for d in items)
        assert name == "test.txt"
    finally:
        get_settings.cache_clear()
