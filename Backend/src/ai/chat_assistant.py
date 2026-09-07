"""
Streaming AI chat assistant with a visible thinking process.
Reuses the same Groq API key already entered in the sidebar (GroqLLM's key),
but streams tokens directly so the UI can show reasoning live - the same
feel as Claude's extended thinking view.
"""

from groq import Groq

SYSTEM_PROMPT = (
    "You are a helpful assistant embedded in a data-analysis dashboard. "
    "First, think through the user's question step by step inside "
    "<thinking>...</thinking> tags. Then, right after closing </thinking>, "
    "give a clear, concise final answer. Always include both parts, even "
    "for simple questions."
)


def stream_chat(api_key: str, message: str, model: str = "llama-3.3-70b-versatile"):
    """
    Yields text chunks as they arrive from Groq. The caller splits
    <thinking>...</thinking> from the final answer as chunks accumulate.
    """
    client = Groq(api_key=api_key)

    stream = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message},
        ],
        temperature=0.3,
        stream=True,
    )

    for chunk in stream:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content
