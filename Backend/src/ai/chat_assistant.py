"""
Streaming AI chat assistant (OpenAI-compatible SDK) with Claude/DeepSeek-style Thinking.
Yields tokens in real-time as they arrive from the LLM provider.
"""

from __future__ import annotations

import os
import time
import httpx
from openai import OpenAI
from dotenv import load_dotenv

from src.ai.llm import _resolve_provider_and_models, _is_conn_err

load_dotenv()

MAX_RETRIES = 2
RETRY_DELAY = 1.0
CONNECT_TIMEOUT = 10.0
READ_TIMEOUT = 45.0

_BASE_SYSTEM = (
    "You are an expert AI Data Analyst assistant embedded in an interactive dataset dashboard.\n"
    "You have full context of the user's uploaded dataset below.\n\n"
    "=== INSTRUCTIONS ===\n"
    "1. First, think step-by-step about the dataset facts, statistics, and user question inside <think>...</think> tags.\n"
    "2. After </think>, provide a clear, concise, and structured answer with bullet points, numbers, and actionable insights.\n"
    "3. Always ground answers strictly on the provided dataset context. Never hallucinate numbers.\n\n"
    "=== DATASET CONTEXT ===\n"
    "{dataset_context}"
)

_NO_DATASET_SYSTEM = (
    "You are a helpful AI Data Analyst. "
    "First think inside <think>...</think>, then politely guide the user to upload a CSV, Excel, or JSON dataset."
)

def build_system_prompt(dataset_context: str | None = None) -> str:
    if dataset_context:
        return _BASE_SYSTEM.format(dataset_context=dataset_context)
    return _NO_DATASET_SYSTEM

def _make_client(api_key: str, base_url: str) -> OpenAI:
    """Create OpenAI client with explicit timeouts to prevent hangs."""
    timeout = httpx.Timeout(
        connect=CONNECT_TIMEOUT,
        read=READ_TIMEOUT,
        write=20.0,
        pool=10.0,
    )
    return OpenAI(api_key=api_key, base_url=base_url, http_client=httpx.Client(timeout=timeout))

def stream_chat(
    api_key: str,
    message: str,
    model: str | None = None,
    dataset_context: str | None = None,
):
    """
    Real-time streaming generator for chat responses.
    Yields string tokens immediately as each chunk arrives from the API.
    """
    provider, base_url, models_to_try = _resolve_provider_and_models(api_key, model)
    client = _make_client(api_key, base_url)
    system_prompt = build_system_prompt(dataset_context)

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": message},
    ]

    last_exc: Exception | None = None

    for chosen_model in models_to_try:
        for attempt in range(1, MAX_RETRIES + 1):
            chunks_yielded = 0
            try:
                stream = client.chat.completions.create(
                    model=chosen_model,
                    messages=messages,
                    temperature=0.3,
                    stream=True,
                    max_tokens=2048,
                )

                for chunk in stream:
                    delta = chunk.choices[0].delta if chunk.choices else None
                    if not delta:
                        continue

                    # Support delta.reasoning_content (DeepSeek/Claude format)
                    rc = getattr(delta, "reasoning_content", None)
                    if rc:
                        # Wrap reasoning in think tags if provided as a field
                        if chunks_yielded == 0 and not rc.startswith("<think>"):
                            yield "<think>"
                        yield rc
                        chunks_yielded += 1

                    c = getattr(delta, "content", None)
                    if c:
                        yield c
                        chunks_yielded += 1

                if chunks_yielded > 0:
                    return  # Successfully finished streaming!

            except Exception as exc:
                last_exc = exc
                if chunks_yielded > 0:
                    # Partial stream succeeded, notify user and finish
                    yield "\n\n*(Stream ended)*"
                    return
                
                # If error happened before any token, retry or fall back
                if _is_conn_err(exc) and attempt < MAX_RETRIES:
                    time.sleep(RETRY_DELAY * attempt)
                    client = _make_client(api_key, base_url)
                    continue
                break  # try next fallback model

    # If all models failed
    yield f"\n\n⚠️ Error getting response from {provider}: `{last_exc}`\nPlease check your internet connection or model availability."
