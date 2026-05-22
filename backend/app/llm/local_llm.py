"""Couche LLM locale : Ollama (défaut) ou llama.cpp (optionnel)."""

from __future__ import annotations

import json
from abc import ABC, abstractmethod
from typing import Any

import httpx

from app.config import Settings, get_settings


class BaseLLM(ABC):
    @abstractmethod
    async def complete(
        self,
        system: str,
        user: str,
        *,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> str:
        pass


class OllamaLLM(BaseLLM):
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._api_root = settings.ollama_api_http_root()
        self._model = settings.llm_model

    async def complete(
        self,
        system: str,
        user: str,
        *,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> str:
        payload: dict[str, Any] = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "stream": False,
            "options": {"temperature": temperature},
        }
        if json_mode:
            payload["format"] = "json"

        async with httpx.AsyncClient(
            timeout=120.0,
            headers=self._settings.ollama_request_headers(),
        ) as client:
            r = await client.post(f"{self._api_root}/api/chat", json=payload)
            if r.is_error:
                snippet = (r.text or "")[:1200].strip()
                msg = f"Ollama HTTP {r.status_code} pour {r.request.url!s}"
                if snippet:
                    msg = f"{msg} — {snippet}"
                raise RuntimeError(msg)
            data = r.json()
        msg = data.get("message") or {}
        return (msg.get("content") or "").strip()


class LlamaCppLLM(BaseLLM):
    """Charge un modèle GGUF via llama-cpp-python si disponible."""

    def __init__(self, settings: Settings) -> None:
        try:
            from llama_cpp import Llama  # type: ignore
        except ImportError as e:
            raise RuntimeError(
                "llama-cpp-python n'est pas installé. Installez-le ou utilisez LLM_PROVIDER=ollama."
            ) from e
        if not settings.llamacpp_model_path:
            raise RuntimeError("LLAMACPP_MODEL_PATH requis pour le provider llamacpp.")
        self._llm = Llama(
            model_path=settings.llamacpp_model_path,
            n_ctx=settings.llamacpp_n_ctx,
            verbose=False,
        )

    async def complete(
        self,
        system: str,
        user: str,
        *,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> str:
        # llama_cpp est synchrone — acceptable pour MVP
        prompt = f"<|system|>\n{system}\n<|user|>\n{user}\n<|assistant|>\n"
        out = self._llm(
            prompt,
            temperature=temperature,
            max_tokens=2048,
        )
        return (out["choices"][0]["text"] or "").strip()


def get_llm(settings: Settings | None = None) -> BaseLLM:
    s = settings or get_settings()
    if s.llm_provider == "llamacpp":
        return LlamaCppLLM(s)
    return OllamaLLM(s)


def safe_parse_json(text: str) -> dict[str, Any]:
    """Extrait un objet JSON d'une réponse LLM."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}
