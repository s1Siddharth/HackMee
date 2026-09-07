# Setup

## 1. Install uv (if you don't have it)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## 2. Install dependencies
```bash
uv sync
```
This creates a `.venv` and installs everything from `pyproject.toml`, and
generates `uv.lock` so your teammates get the exact same versions.

## 3. Set your Groq key
```bash
cp .env.example .env
```
Open `.env` and add `GROQ_API_KEY=your-key-here` (free key at console.groq.com).

## 4. Run the Streamlit app (full UI, works standalone)
```bash
uv run streamlit run app.py
```

## 5. Run the API instead (for your friend's TypeScript frontend)
```bash
uv run uvicorn api:app --reload
```
Open `http://127.0.0.1:8000/docs` to test `/analyze` (upload a dataset,
get the full pipeline back as JSON) and `/chat/stream` (the AI assistant,
streamed as Server-Sent Events with `<thinking>` reasoning included).

Both `app.py` and `api.py` call the exact same code in `src/` - nothing is
duplicated, so a fix in `src/` improves both the Streamlit demo and the API.

## What's new since the original Datathon project
- `src/ai/chat_assistant.py` - streaming chat with visible thinking
- Floating "💬 Assistant" button added to `app.py` (bottom-left)
- `api.py` - JSON API wrapping the same pipeline, for the TS frontend
- Switched from `requirements.txt`/pip to `uv` + `pyproject.toml`
- No automation/Make.com anywhere in this build
