"""Pydantic DTOs for REST API."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    message: str = Field(..., min_length=1, max_length=32000)
    mode: Literal["simple", "detailed", "technical", "procedure"] = "detailed"
    conversation_id: str | None = Field(None, alias="conversationId")
    text_a: str | None = Field(None, alias="textA")
    text_b: str | None = Field(None, alias="textB")
    context_text: str | None = Field(
        None,
        alias="contextText",
        description="Texte à résumer si la question est un résumé",
    )


class CitationItem(BaseModel):
    document_title: str | None = None
    article_number: str | None = None
    source: str | None = None
    excerpt: str | None = None
    relevance_score: float | None = None
    official_hint: str | None = Field(
        None,
        description="Indicateur source officielle estimée",
    )


class WorkflowTraceItem(BaseModel):
    step: str
    detail: str | None = None
    payload: dict[str, Any] | None = None


class ChatResponse(BaseModel):
    answer: str
    query_type: str = Field(..., serialization_alias="queryType")
    citations: list[CitationItem]
    confidence_score: float = Field(..., serialization_alias="confidenceScore")
    workflow_trace: list[WorkflowTraceItem] = Field(
        ...,
        serialization_alias="workflowTrace",
    )
    llm_model: str = Field(..., serialization_alias="model")
    source_policy: str = Field("local-open-source", serialization_alias="sourcePolicy")
    conversation_id: str | None = Field(None, serialization_alias="conversationId")

    model_config = ConfigDict(
        populate_by_name=True,
        ser_json_by_alias=True,
        protected_namespaces=(),
    )


class DocumentUploadResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, ser_json_by_alias=True)

    document_id: str = Field(..., serialization_alias="documentId")
    filename: str
    status: str


class DocumentItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True, ser_json_by_alias=True)

    document_id: str = Field(..., serialization_alias="documentId")
    filename: str
    status: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    chunk_count: int = Field(0, serialization_alias="chunkCount")


class IndexRequest(BaseModel):
    document_ids: list[str] | None = None
    reindex_all: bool = False


class CompareRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    text_a: str = Field(..., alias="textA", min_length=1)
    text_b: str = Field(..., alias="textB", min_length=1)


class CompareResponse(BaseModel):
    main_differences: str
    added_obligations: str
    removed_obligations: str
    practical_impact: str


class SummarizeRequest(BaseModel):
    text: str
    mode: Literal["simple", "detailed"] = "simple"


class SummarizeResponse(BaseModel):
    summary: str
    key_points: list[str]
    obligations: list[str]
    risks: list[str]
    key_articles: list[str]


class QuizRequest(BaseModel):
    filiere: str = Field(..., min_length=1, max_length=200)
    count: int = Field(5, ge=1, le=10)
    difficulty: Literal["facile", "moyen", "difficile"] = "moyen"


class QuizQuestion(BaseModel):
    model_config = ConfigDict(populate_by_name=True, ser_json_by_alias=True)

    question: str
    options: list[str]
    correct_index: int = Field(..., serialization_alias="correctIndex")
    explanation: str | None = None


class QuizResponse(BaseModel):
    filiere: str
    questions: list[QuizQuestion]


class HealthResponse(BaseModel):
    status: str
    llm: str
    vector_db: str = Field(..., serialization_alias="vectorDb")
    embedding_model: str = Field(..., serialization_alias="embeddingModel")

    model_config = ConfigDict(populate_by_name=True, ser_json_by_alias=True)
