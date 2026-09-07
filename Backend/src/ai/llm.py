from __future__ import annotations

import os

from dotenv import load_dotenv
from groq import Groq


load_dotenv()


class GroqLLM:
    """Groq LLM client supporting user-provided API keys."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
    ) -> None:

        # User-provided API key has priority.
        # Environment variable is used as a fallback
        # for local development.
        self.api_key = (
            api_key
            or os.getenv("GROQ_API_KEY")
        )

        if not self.api_key:
            raise ValueError(
                "Groq API key is required."
            )

        self.client = Groq(
            api_key=self.api_key
        )

        self.model = model or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    def generate(
        self,
        prompt: str,
    ) -> str:
        """Generate a response using Groq."""

        if not prompt.strip():
            raise ValueError(
                "Prompt cannot be empty."
            )

        try:

            response = (
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are an expert data analyst. "
                                "Analyze only the evidence provided. "
                                "Never invent numerical facts. "
                                "Clearly distinguish observations "
                                "from recommendations."
                            ),
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        },
                    ],
                    temperature=0.2,
                )
            )

            content = (
                response
                .choices[0]
                .message
                .content
            )

            if not content:
                raise RuntimeError(
                    "Groq returned an empty response."
                )

            return content

        except Exception as exc:

            raise RuntimeError(
                f"Groq request failed: {exc}"
            ) from exc