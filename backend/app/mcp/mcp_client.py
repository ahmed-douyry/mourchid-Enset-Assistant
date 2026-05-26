"""Client MCP externe (désactivé par défaut)."""

from __future__ import annotations

from app.config import get_settings


async def call_external_tool(_name: str, _arguments: dict) -> str:
    s = get_settings()
    if not s.mcp_external_enabled:
        return "MCP externe désactivé (MCP_EXTERNAL_ENABLED=false)."
    return "Non configuré : définissez MCP_EXTERNAL_COMMAND et implémentez le client."
