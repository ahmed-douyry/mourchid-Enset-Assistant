"""Application configuration (local-first, open-source defaults)."""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ollama_base_url: str = Field(default="http://localhost:11434", alias="OLLAMA_BASE_URL")
    ollama_api_key: str = Field(default="", alias="OLLAMA_API_KEY")
    ollama_api_http_base: str = Field(
        default="",
        alias="OLLAMA_API_HTTP_BASE",
        description="Surcharge URL racine pour les appels /api/* Ollama.",
    )
    llm_model: str = Field(default="gpt-oss:120b-cloud", alias="LLM_MODEL")
    llm_provider: Literal["ollama", "llamacpp"] = Field(default="ollama", alias="LLM_PROVIDER")
    llamacpp_model_path: str = Field(default="", alias="LLAMACPP_MODEL_PATH")
    llamacpp_n_ctx: int = Field(default=4096, alias="LLAMACPP_N_CTX")

    embedding_model: str = Field(
        default="intfloat/multilingual-e5-base",
        alias="EMBEDDING_MODEL",
    )

    vector_db: Literal["qdrant", "chroma"] = Field(default="qdrant", alias="VECTOR_DB")
    qdrant_url: str = Field(default="http://localhost:6333", alias="QDRANT_URL")
    qdrant_collection: str = Field(default="enset_academic", alias="QDRANT_COLLECTION")
    chroma_path: str = Field(default="./app/data/processed/chroma", alias="CHROMA_PATH")

    reranker_enabled: bool = Field(default=False, alias="RERANKER_ENABLED")
    reranker_model: str = Field(
        default="cross-encoder/ms-marco-MiniLM-L-6-v2",
        alias="RERANKER_MODEL",
    )

    data_dir: str = Field(default="./app/data", alias="DATA_DIR")

    whisper_model: str = Field(default="openai/whisper-base", alias="WHISPER_MODEL")
    whisper_language: str = Field(default="french", alias="WHISPER_LANGUAGE")

    cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        alias="CORS_ORIGINS",
    )

    mcp_external_enabled: bool = Field(default=False, alias="MCP_EXTERNAL_ENABLED")
    mcp_external_command: str = Field(default="", alias="MCP_EXTERNAL_COMMAND")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def resolved_data_dir(self) -> Path:
        """Chemin absolu du répertoire data, indépendant du cwd uvicorn."""
        p = Path(self.data_dir)
        if p.is_absolute():
            return p
        return (_BACKEND_ROOT / p).resolve()

    def ollama_request_headers(self) -> dict[str, str]:
        """En-têtes pour l'API Ollama (modèles cloud : Bearer OLLAMA_API_KEY)."""
        key = self.ollama_api_key.strip()
        if not key:
            return {}
        return {"Authorization": f"Bearer {key}"}

    def ollama_api_http_root(self) -> str:
        """Racine pour les appels REST /api/tags, /api/chat, etc.

        D'après la doc Ollama, les clés API s'utilisent avec ``https://ollama.com/api``.
        Sans clé, on utilise le serveur local ``OLLAMA_BASE_URL``.
        """
        override = self.ollama_api_http_base.strip()
        if override:
            return override.rstrip("/")
        if self.ollama_api_key.strip():
            return "https://ollama.com"
        return self.ollama_base_url.rstrip("/")


@lru_cache
def get_settings() -> Settings:
    return Settings()
