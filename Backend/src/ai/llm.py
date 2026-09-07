from __future__ import annotations

import os
import time
import httpx
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

_MAX_RETRIES = 3
_RETRY_DELAY = 1.0

_CONN_ERRORS = (
    "wsarecv", "connection aborted", "connection reset",
    "stream reading error", "connectionreset", "broken pipe",
    "eof occurred", "remote end closed", "temporarily overloaded"
)

def _is_conn_err(exc: Exception) -> bool:
    msg = str(exc).lower()
    return any(k in msg for k in _CONN_ERRORS)

def _make_client(api_key: str, base_url: str) -> OpenAI:
    """Create OpenAI client with proper timeouts."""
    timeout = httpx.Timeout(connect=10.0, read=45.0, write=20.0, pool=10.0)
    return OpenAI(
        api_key=api_key,
        base_url=base_url,
        http_client=httpx.Client(timeout=timeout)
    )

def _resolve_provider_and_models(api_key: str, requested_model: str | None = None):
    """
    Auto-detects provider (NVIDIA, Groq, OpenRouter) based on key prefix or env configs.
    Returns (provider_name, base_url, list_of_models_to_try).
    """
    if api_key.startswith("nvapi-"):
        provider = "NVIDIA NIM"
        base_url = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
        default_model = os.getenv("NVIDIA_MODEL", "meta/llama-3.2-11b-vision-instruct")
        fallback_model = os.getenv("NVIDIA_FALLBACK", "nvidia/nemotron-3-super-120b-a12b")
        models = [requested_model or default_model, fallback_model]
    elif api_key.startswith("gsk_"):
        provider = "Groq"
        base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
        models = [
            requested_model or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            "llama-3.1-8b-instant",
        ]
    else:
        provider = "OpenRouter"
        base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
        default_model = os.getenv("OPENROUTER_MODEL", "minimax/minimax-m3:free")
        fallback_model = os.getenv("OPENROUTER_FALLBACK_1", "nvidia/nemotron-3-super-120b-a12b:free")
        models = [requested_model or default_model, fallback_model]
    
    unique_models = list(dict.fromkeys([m for m in models if m]))
    return provider, base_url, unique_models

_SYSTEM_PROMPT = (
    "You are an expert AI data analyst. "
    "Analyze only the evidence provided. "
    "Never invent numerical facts. "
    "Clearly distinguish observations from recommendations."
)

class GroqLLM:
    """
    Universal LLM client that works seamlessly with NVIDIA, OpenRouter, or Groq
    via the OpenAI-compatible SDK with automatic model fallbacks.
    """

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
    ) -> None:
        self.api_key = (
            api_key
            or os.getenv("NVIDIA_API_KEY")
            or os.getenv("OPENROUTER_API_KEY")
            or os.getenv("GROQ_API_KEY")
        )

        if not self.api_key:
            raise ValueError(
                "API key is required. Set NVIDIA_API_KEY (build.nvidia.com), "
                "OPENROUTER_API_KEY (openrouter.ai/keys), or GROQ_API_KEY."
            )

        self.provider, self.base_url, self._models = _resolve_provider_and_models(self.api_key, model)
        self.model = self._models[0]
        self.client = _make_client(self.api_key, self.base_url)

    def generate(self, prompt: str) -> str:
        """Generate a response with retries for connection errors and model fallback."""
        if not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        last_exc = None
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ]

        for model in self._models:
            for attempt in range(1, _MAX_RETRIES + 1):
                try:
                    response = self.client.chat.completions.create(
                        model=model,
                        messages=messages,
                        temperature=0.2,
                        max_tokens=2048,
                    )
                    content = response.choices[0].message.content
                    if not content:
                        raise RuntimeError(f"Model {model!r} returned empty response.")
                    return content

                except Exception as exc:
                    last_exc = exc
                    if _is_conn_err(exc) and attempt < _MAX_RETRIES:
                        time.sleep(_RETRY_DELAY * attempt)
                        self.client = _make_client(self.api_key, self.base_url)
                        continue
                    break

        raise RuntimeError(
            f"All models in fallback chain failed. Last error: {last_exc}"
        )