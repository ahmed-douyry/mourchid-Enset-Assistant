"""Routes documents."""

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.schemas import DocumentItem, DocumentUploadResponse, IndexRequest
from app.services import document_service

router = APIRouter(tags=["documents"])


@router.post("/documents/upload", response_model=DocumentUploadResponse, response_model_by_alias=True)
async def upload_document(file: UploadFile = File(...)) -> DocumentUploadResponse:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Fichier vide")
    doc_id, name = await document_service.save_upload(file.filename or "document.pdf", data)
    return DocumentUploadResponse(document_id=doc_id, filename=name, status="uploaded")


@router.get("/documents", response_model=list[DocumentItem], response_model_by_alias=True)
async def get_documents() -> list[DocumentItem]:
    return document_service.list_documents()


@router.post("/documents/index")
async def post_index(body: IndexRequest) -> dict:
    return await document_service.index_documents(body.document_ids, body.reindex_all)


@router.delete("/documents/{document_id}")
async def delete_document_route(document_id: str) -> dict:
    await document_service.remove_document(document_id)
    return {"ok": True, "document_id": document_id}
