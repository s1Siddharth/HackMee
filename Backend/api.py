"""
JSON API for the Datathon pipeline, for a separately-built frontend
(e.g. a TypeScript app) to call over HTTP. This wraps the exact same
src/ modules the Streamlit app (app.py) uses - no logic is duplicated.

Run with:
    uv run uvicorn api:app --reload
Then open http://127.0.0.1:8000/docs to test /analyze and /chat/stream.
"""

import io
import json
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.ingestion.loader import DatasetLoader
from src.preprocessing.profiler import DataProfiler
from src.preprocessing.cleaner import DataCleaner
from src.visualization.recommendations import VisualizationRecommender
from src.analytics.anomaly_detector import AnomalyDetector
from src.ai.insight_analyzer import InsightAnalyzer
from src.ai.prompt_builder import InsightPromptBuilder
from src.ai.llm import GroqLLM
from src.ai.chat_assistant import stream_chat

app = FastAPI(title="Datathon API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # fine for a hackathon demo; tighten later if you have time
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "backend running"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...), groq_api_key: str = Form(None)):
    """
    Runs the full pipeline: load -> clean -> profile -> analyze -> AI insight
    -> anomaly detection -> chart recommendations, and returns it as one JSON
    object for the frontend to render.
    """
    contents = await file.read()
    buffer = io.BytesIO(contents)
    buffer.name = file.filename  # DatasetLoader needs this to detect the extension

    df = DatasetLoader.load(buffer)

    # Clean
    cleaner = DataCleaner(df)
    cleaned_df = cleaner.clean()
    cleaning_report = cleaner.get_cleaning_report().to_dict(orient="records")
    comparison = cleaner.get_comparison()

    # Profile
    profiler = DataProfiler(cleaned_df)
    basic_metrics = profiler.get_basic_metrics()
    column_types = profiler.get_column_types()
    quality_score = profiler.calculate_quality_score()

    # Evidence + AI insight
    analyzer = InsightAnalyzer(cleaned_df)
    evidence = analyzer.generate_evidence()

    ai_insight = None
    if groq_api_key:
        try:
            prompt = InsightPromptBuilder.build(evidence)
            llm = GroqLLM(api_key=groq_api_key)
            ai_insight = llm.generate(prompt)
        except Exception as exc:
            ai_insight = f"AI insight unavailable: {exc}"

    # Anomalies
    _, anomaly_summary = AnomalyDetector(cleaned_df).analyze()

    # Chart recommendations (frontend builds the actual charts from this)
    chart_recommendations = VisualizationRecommender(cleaned_df).recommend()

    return {
        "filename": file.filename,
        "basic_metrics": basic_metrics,
        "column_types": column_types,
        "quality_score": quality_score,
        "cleaning_report": cleaning_report,
        "comparison": comparison,
        "evidence": evidence,
        "ai_insight": ai_insight,
        "anomaly_summary": anomaly_summary,
        "chart_recommendations": chart_recommendations,
    }


class ChatRequest(BaseModel):
    message: str
    groq_api_key: str


@app.post("/chat/stream")
def chat_stream(req: ChatRequest):
    """
    Streams the assistant's response as Server-Sent Events. Each event is
    `data: {"text": "<token>"}`, wrapping reasoning in <thinking> tags so
    the frontend can show it live, then `data: [DONE]` at the end.
    """
    def event_stream():
        for token in stream_chat(req.groq_api_key, req.message):
            yield f"data: {json.dumps({'text': token})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
