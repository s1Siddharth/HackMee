"""
FastAPI backend for the HackMee Data Analysis platform.

Endpoints consumed by the React/Vite frontend:
  POST /upload             – accept file, start pipeline in background thread
  GET  /status/{id}        – poll processing stage & progress
  GET  /analysis/{id}      – fetch full analysis result (AnalysisResponse shape)
  GET  /history            – list all processed datasets
  POST /chat/stream        – SSE streaming AI chat (with dataset context injected)
  GET  /health             – liveness check

Run:
    uv run uvicorn api:app --reload --host 0.0.0.0 --port 8000
Then open http://127.0.0.1:8000/docs to explore the API.
"""

from __future__ import annotations

import io
import json
import uuid
import math
import os
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor
from threading import Lock
from typing import Any

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from src.ingestion.loader import DatasetLoader
from src.preprocessing.profiler import DataProfiler
from src.preprocessing.cleaner import DataCleaner
from src.visualization.recommendations import VisualizationRecommender
from src.analytics.anomaly_detector import AnomalyDetector
from src.ai.insight_analyzer import InsightAnalyzer
from src.ai.prompt_builder import InsightPromptBuilder
from src.ai.llm import GroqLLM
from src.ai.chat_assistant import stream_chat

load_dotenv()

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(title="HackMee Data Analysis API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory job store ───────────────────────────────────────────────────────
# Keyed by dataset_id (UUID string).
# Each entry: { status: StatusRecord, result: AnalysisRecord | None }

_JOBS: dict[str, dict] = {}
_JOBS_LOCK = Lock()
_executor = ThreadPoolExecutor(max_workers=4)

# ─── Helpers ───────────────────────────────────────────────────────────────────

def _safe(val: Any) -> Any:
    """Recursively convert numpy / pandas scalars to JSON-safe Python types."""
    if isinstance(val, dict):
        return {k: _safe(v) for k, v in val.items()}
    if isinstance(val, list):
        return [_safe(v) for v in val]
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        f = float(val)
        return None if (math.isnan(f) or math.isinf(f)) else round(f, 6)
    if isinstance(val, (np.bool_,)):
        return bool(val)
    if isinstance(val, pd.Timestamp):
        return val.isoformat()
    if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
        return None
    return val


def _update_status(dataset_id: str, stage: str, progress: int, message: str = "") -> None:
    with _JOBS_LOCK:
        _JOBS[dataset_id]["status"] = {
            "stage": stage,
            "progress": progress,
            "message": message,
            "currentStepIndex": _STAGE_INDEX.get(stage, 0),
            "error": None,
        }


_STAGE_INDEX = {
    "detecting": 0,
    "cleaning": 1,
    "analyzing": 2,
    "generating": 3,
    "done": 4,
    "failed": 4,
}


def _build_columns(cleaned_df: pd.DataFrame, profiler: DataProfiler) -> list[dict]:
    """Build the ColumnInfo list expected by the frontend."""
    col_types = profiler.get_column_types()
    numeric_set = set(col_types["numeric"])
    datetime_set = set(col_types["datetime"])

    columns = []
    for col in cleaned_df.columns:
        if col in numeric_set:
            col_type = "numeric"
        elif col in datetime_set:
            col_type = "date"
        else:
            col_type = "categorical"

        series = cleaned_df[col]
        stats: dict = {}

        if col_type == "numeric":
            s = pd.to_numeric(series, errors="coerce").dropna()
            if not s.empty:
                stats = {
                    "min": _safe(s.min()),
                    "max": _safe(s.max()),
                    "mean": _safe(round(float(s.mean()), 3)),
                    "median": _safe(round(float(s.median()), 3)),
                    "nullCount": int(series.isna().sum()),
                    "nullPercentage": _safe(round(series.isna().mean() * 100, 2)),
                }
        elif col_type == "categorical":
            vc = series.value_counts(dropna=True).head(5)
            stats = {
                "uniqueValues": int(series.nunique()),
                "nullCount": int(series.isna().sum()),
                "nullPercentage": _safe(round(series.isna().mean() * 100, 2)),
                "topCategories": [
                    {"value": str(k), "count": int(v)} for k, v in vc.items()
                ],
            }

        columns.append({"name": col, "type": col_type, "stats": stats})

    return columns


def _is_id_or_flag_column(col_name: str, series: pd.Series) -> bool:
    """Identify if a column is an ID, index, key, or binary flag rather than a quantitative metric."""
    lower = col_name.lower().strip()
    id_terms = ["_id", "id_", "uuid", "guid", "ssn", "phone", "zipcode", "postal", "employee_id", "user_id", "cust_id"]
    if any(t in lower for t in id_terms) or lower.startswith("id") or lower.endswith("_id") or lower == "id":
        return True
    # If it's an integer sequence or nearly all unique integers
    if pd.api.types.is_numeric_dtype(series):
        non_null = series.dropna()
        if len(non_null) > 10 and non_null.nunique() == len(non_null):
            return True
        # If it's binary 0/1, it's a flag, not a continuous variable
        if non_null.nunique() <= 2:
            return True
    return False


def _humanize_title(name: str) -> str:
    """Convert snake_case or survey prompts to readable titles."""
    cleaned = (
        name.replace("please_enter_your_", "")
        .replace("please_select_your_", "")
        .replace("please_enter_", "")
        .replace("please_select_", "")
        .replace("_", " ")
        .strip()
    )
    return cleaned.title() if cleaned else name


def _build_charts(cleaned_df: pd.DataFrame, evidence: dict) -> list[dict]:
    """Build chart items from evidence data for recharts."""
    charts = []

    # Distinguish true quantitative metric columns vs ID/categorical
    all_numeric = [
        col for col in cleaned_df.columns
        if pd.api.types.is_numeric_dtype(cleaned_df[col])
    ]
    numeric_cols = [
        col for col in all_numeric
        if not _is_id_or_flag_column(col, cleaned_df[col])
    ]
    # Fallback to all_numeric if no strict continuous columns found
    if not numeric_cols:
        numeric_cols = all_numeric

    categorical_cols = [
        col for col in cleaned_df.columns
        if pd.api.types.is_string_dtype(cleaned_df[col]) or
           pd.api.types.is_categorical_dtype(cleaned_df[col]) or
           (pd.api.types.is_numeric_dtype(cleaned_df[col]) and _is_id_or_flag_column(col, cleaned_df[col]))
    ]
    datetime_cols = [
        col for col in cleaned_df.columns
        if pd.api.types.is_datetime64_any_dtype(cleaned_df[col])
    ]

    sample = cleaned_df.head(200)

    # 1. Bar charts for categorical × numeric metric
    if categorical_cols and numeric_cols:
        cat_col = categorical_cols[0]
        for num_col in numeric_cols[:2]:
            grouped = (
                sample.groupby(cat_col)[num_col]
                .mean()
                .dropna()
                .head(15)
                .reset_index()
            )
            if not grouped.empty:
                charts.append({
                    "id": f"bar_{cat_col}_{num_col}",
                    "type": "bar",
                    "title": f"{_humanize_title(num_col)} by {_humanize_title(cat_col)}",
                    "caption": f"Average {_humanize_title(num_col)} grouped by {_humanize_title(cat_col)}",
                    "xAxisKey": cat_col,
                    "yAxisKey": num_col,
                    "data": _safe(grouped.to_dict(orient="records")),
                })

    # 2. Scatter for continuous numeric pairs (non-ID)
    if len(numeric_cols) >= 2:
        for i in range(min(len(numeric_cols) - 1, 2)):
            x_col = numeric_cols[i]
            y_col = numeric_cols[i + 1]
            scatter_data = (
                sample[[x_col, y_col]]
                .dropna()
                .head(150)
            )
            if not scatter_data.empty:
                charts.append({
                    "id": f"scatter_{x_col}_{y_col}",
                    "type": "scatter",
                    "title": f"{_humanize_title(x_col)} vs {_humanize_title(y_col)}",
                    "caption": f"Scatter plot of {_humanize_title(x_col)} against {_humanize_title(y_col)}",
                    "xAxisKey": x_col,
                    "yAxisKey": y_col,
                    "data": _safe(scatter_data.to_dict(orient="records")),
                })

    # 3. Line charts for time series
    if datetime_cols and numeric_cols:
        date_col = datetime_cols[0]
        num_col = numeric_cols[0]
        ts_data = (
            sample[[date_col, num_col]]
            .dropna()
            .sort_values(date_col)
            .head(100)
        )
        ts_data[date_col] = ts_data[date_col].astype(str)
        if not ts_data.empty:
            charts.append({
                "id": f"line_{date_col}_{num_col}",
                "type": "line",
                "title": f"{_humanize_title(num_col)} over time",
                "caption": f"Trend of {_humanize_title(num_col)} over {_humanize_title(date_col)}",
                "xAxisKey": date_col,
                "yAxisKey": num_col,
                "data": _safe(ts_data.to_dict(orient="records")),
            })

    # 4. Pie chart for primary categorical distributions
    if categorical_cols:
        for cat_col in categorical_cols[:2]:
            vc = cleaned_df[cat_col].value_counts(dropna=True).head(8)
            if not vc.empty and len(vc) >= 2:
                charts.append({
                    "id": f"pie_{cat_col}",
                    "type": "pie",
                    "title": f"Distribution of {_humanize_title(cat_col)}",
                    "caption": f"Share of each category in {_humanize_title(cat_col)}",
                    "xAxisKey": "name",
                    "yAxisKey": "value",
                    "data": _safe([{"name": str(k), "value": int(v)} for k, v in vc.items()]),
                })

    return charts


def _build_correlations(cleaned_df: pd.DataFrame) -> dict:
    """Build the correlation matrix for quantitative metrics."""
    numeric_df = cleaned_df.select_dtypes(include="number")
    # Exclude ID or pure index columns from correlation matrix
    valid_cols = [
        col for col in numeric_df.columns
        if not _is_id_or_flag_column(col, numeric_df[col])
    ]
    if len(valid_cols) < 2:
        valid_cols = numeric_df.columns.tolist()

    if len(valid_cols) < 2:
        return {"columns": [], "matrix": []}

    corr = numeric_df[valid_cols].corr().fillna(0)
    cols = corr.columns.tolist()
    matrix = [[_safe(corr.loc[r, c]) for c in cols] for r in cols]
    return {"columns": cols, "matrix": matrix}


def _build_outliers(cleaned_df: pd.DataFrame) -> list[dict]:
    """Build the outlier list for the frontend OutliersAndClusters component."""
    outliers = []
    numeric_cols = cleaned_df.select_dtypes(include="number").columns.tolist()

    for col in numeric_cols[:5]:  # limit to avoid huge payloads
        series = cleaned_df[col].dropna()
        if series.empty:
            continue
        q1, q3 = series.quantile(0.25), series.quantile(0.75)
        iqr = q3 - q1
        if iqr == 0:
            continue
        lb, ub = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        mask = (series < lb) | (series > ub)
        bad_rows = cleaned_df[mask].head(20)
        for idx, row in bad_rows.iterrows():
            val = float(row[col])
            severity = (
                "high" if abs(val - series.mean()) > 3 * series.std()
                else "medium" if abs(val - series.mean()) > 2 * series.std()
                else "low"
            )
            outliers.append({
                "id": str(idx),
                "column": col,
                "value": _safe(val),
                "severity": severity,
                "reason": f"Outside IQR bounds [{_safe(round(lb,2))}, {_safe(round(ub,2))}]",
                "rowValues": _safe({c: row[c] for c in cleaned_df.columns[:6]}),
            })

    return outliers


def _build_diffs(original_df: pd.DataFrame, cleaned_df: pd.DataFrame) -> list[dict]:
    """Build cell-level diffs between original and cleaned data for the table."""
    diffs = []
    orig_cols = set(original_df.columns)
    clean_cols = set(cleaned_df.columns)
    common = list(orig_cols & clean_cols)

    orig_reset = original_df[common].reset_index(drop=True)
    clean_reset = cleaned_df[common].reset_index(drop=True)
    max_rows = min(len(orig_reset), len(clean_reset), 500)

    for col in common:
        for i in range(max_rows):
            try:
                orig_val = orig_reset.at[i, col]
                clean_val = clean_reset.at[i, col]
                # Compare; treat NaN == NaN as equal
                if pd.isna(orig_val) and pd.isna(clean_val):
                    continue
                if str(orig_val) != str(clean_val):
                    diffs.append({
                        "rowIndex": i,
                        "column": col,
                        "originalValue": _safe(orig_val),
                        "cleanedValue": _safe(clean_val),
                        "action": "imputed",
                    })
                    if len(diffs) >= 200:  # cap
                        return diffs
            except Exception:
                pass
    return diffs


def _run_pipeline(dataset_id: str, file_bytes: bytes, filename: str) -> None:
    """Full pipeline executed in a background thread."""
    try:
        # Stage 1: Detecting
        _update_status(dataset_id, "detecting", 10, "Loading dataset…")
        buffer = io.BytesIO(file_bytes)
        buffer.name = filename
        df = DatasetLoader.load(buffer)

        # Stage 2: Cleaning
        _update_status(dataset_id, "cleaning", 30, "Cleaning data…")
        cleaner = DataCleaner(df)
        cleaned_df = cleaner.clean()
        comparison = cleaner.get_comparison()

        # Stage 3: Analyzing
        _update_status(dataset_id, "analyzing", 55, "Profiling columns…")
        profiler = DataProfiler(cleaned_df)
        basic_metrics = profiler.get_basic_metrics()
        quality_score = profiler.calculate_quality_score()

        analyzer = InsightAnalyzer(cleaned_df)
        evidence = analyzer.generate_evidence()

        # AI insight (uses env key automatically, no user key required)
        _update_status(dataset_id, "analyzing", 65, "Generating AI insights…")
        ai_insight: str | None = None
        try:
            llm = GroqLLM()  # reads NVIDIA_API_KEY / OPENROUTER_API_KEY from .env
            prompt = InsightPromptBuilder.build(evidence)
            ai_insight = llm.generate(prompt)
        except Exception as exc:
            ai_insight = f"AI insight unavailable: {exc}"

        # Anomaly detection
        _update_status(dataset_id, "analyzing", 75, "Detecting anomalies…")
        try:
            _, anomaly_summary = AnomalyDetector(cleaned_df).analyze()
        except Exception:
            anomaly_summary = {}

        # Stage 4: Generating charts / correlations
        _update_status(dataset_id, "generating", 88, "Building visualizations…")
        columns_info = _build_columns(cleaned_df, profiler)
        charts = _build_charts(cleaned_df, evidence)
        correlations = _build_correlations(cleaned_df)
        outliers = _build_outliers(cleaned_df)
        diffs = _build_diffs(df, cleaned_df)

        # Samples for table view (max 200 rows)
        raw_sample = _safe(
            df.head(200).astype(str).to_dict(orient="records")
        )
        cleaned_sample = _safe(
            cleaned_df.head(200).astype(str).to_dict(orient="records")
        )

        # Build the AnalysisResponse object
        analysis_result = {
            "dataset_id": dataset_id,
            "name": filename,
            "summary": ai_insight or "Dataset processed successfully.",
            "stats": {
                "rows": int(basic_metrics["rows"]),
                "columns": int(basic_metrics["columns"]),
                "missing_handled": int(comparison.get("original_missing", 0) - comparison.get("cleaned_missing", 0)),
                "duplicates_removed": int(comparison.get("original_rows", 0) - comparison.get("cleaned_rows", 0)),
                "cleaned_at": datetime.now(timezone.utc).isoformat(),
                "data_quality_score": float(quality_score),
            },
            "columns": columns_info,
            "charts": charts,
            "correlations": correlations,
            "outliers": outliers,
            "clusters": [],          # future: add k-means cluster points
            "rawDataSample": raw_sample,
            "cleanedDataSample": cleaned_sample,
            "diffs": diffs,
            # Store evidence as dataset context for chat
            "_evidence": evidence,
        }

        with _JOBS_LOCK:
            _JOBS[dataset_id]["result"] = analysis_result
            _JOBS[dataset_id]["status"] = {
                "stage": "done",
                "progress": 100,
                "message": "Pipeline complete",
                "currentStepIndex": 4,
                "error": None,
            }

    except Exception as exc:
        with _JOBS_LOCK:
            _JOBS[dataset_id]["status"] = {
                "stage": "failed",
                "progress": 0,
                "message": "Pipeline failed",
                "currentStepIndex": 4,
                "error": str(exc),
            }


# ─── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "name": "HackMee Data Analysis API",
        "status": "online",
        "version": "2.0.0",
        "docs": "/docs",
        "frontend": "http://localhost:5173",
        "endpoints": {
            "health": "/health",
            "upload": "/upload",
            "history": "/history",
            "docs": "/docs"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "backend running", "version": "2.0.0"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Accept a CSV/XLSX/JSON file, start the analysis pipeline in a background
    thread, and immediately return a dataset_id for the client to poll.
    """
    dataset_id = str(uuid.uuid4())
    file_bytes = await file.read()

    with _JOBS_LOCK:
        _JOBS[dataset_id] = {
            "status": {
                "stage": "detecting",
                "progress": 5,
                "message": "Queued for processing…",
                "currentStepIndex": 0,
                "error": None,
            },
            "result": None,
            "filename": file.filename,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    _executor.submit(_run_pipeline, dataset_id, file_bytes, file.filename)

    return {
        "dataset_id": dataset_id,
        "status": "queued",
        "filename": file.filename,
        "sizeBytes": len(file_bytes),
    }


@app.get("/status/{dataset_id}")
def get_status(dataset_id: str):
    """Poll the current stage and progress of a dataset pipeline."""
    with _JOBS_LOCK:
        job = _JOBS.get(dataset_id)

    if not job:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id!r} not found")

    return job["status"]


@app.get("/analysis/{dataset_id}")
def get_analysis(dataset_id: str):
    """Return the full analysis result once the pipeline is done."""
    with _JOBS_LOCK:
        job = _JOBS.get(dataset_id)

    if not job:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id!r} not found")

    if job["status"]["stage"] not in ("done",):
        raise HTTPException(
            status_code=202,
            detail=f"Pipeline not complete yet. Stage: {job['status']['stage']}",
        )

    result = job.get("result")
    if not result:
        raise HTTPException(status_code=500, detail="Result missing despite done status")

    # Return everything except the internal _evidence key
    return {k: v for k, v in result.items() if not k.startswith("_")}


@app.get("/history")
def get_history():
    """Return a list of all processed datasets (most recent first)."""
    with _JOBS_LOCK:
        jobs_snapshot = list(_JOBS.items())

    history = []
    for dataset_id, job in jobs_snapshot:
        result = job.get("result")
        status_stage = job["status"]["stage"]
        history.append({
            "dataset_id": dataset_id,
            "name": job.get("filename", "Unknown"),
            "filename": job.get("filename", "Unknown"),
            "created_at": job.get("created_at", ""),
            "rows": result["stats"]["rows"] if result else 0,
            "columns": result["stats"]["columns"] if result else 0,
            "status": "ready" if status_stage == "done" else (
                "failed" if status_stage == "failed" else "processing"
            ),
            "missing_handled": result["stats"]["missing_handled"] if result else 0,
        })

    # Most recent first
    history.sort(key=lambda x: x["created_at"], reverse=True)
    return history


# ─── AI Chat ───────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    dataset_id: str | None = None   # optional: inject dataset context
    api_key: str | None = None      # optional: user-provided key override


@app.post("/chat/stream")
def chat_stream(req: ChatRequest):
    """
    Stream the AI assistant response as Server-Sent Events.
    If dataset_id is provided, the system prompt is enriched with real
    dataset stats so the AI can answer questions about the actual data.

    Each SSE event: data: {"text": "<token>"}
    Final event:    data: [DONE]
    """
    # Resolve API key: user override > env key
    api_key = (
        req.api_key
        or os.getenv("NVIDIA_API_KEY")
        or os.getenv("OPENROUTER_API_KEY")
        or os.getenv("GROQ_API_KEY")
    )
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="No API key available. Set NVIDIA_API_KEY or OPENROUTER_API_KEY in Backend/.env",
        )

    # Build dataset context string
    dataset_context: str | None = None
    if req.dataset_id:
        with _JOBS_LOCK:
            job = _JOBS.get(req.dataset_id)
        if job and job.get("result"):
            evidence = job["result"].get("_evidence")
            if evidence:
                dataset_context = json.dumps(evidence, indent=2)

    def event_stream():
        try:
            for token in stream_chat(api_key, req.message, dataset_context=dataset_context):
                yield f"data: {json.dumps({'text': token})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'text': f'⚠️ Error: {exc}'})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.on_event("startup")
def preload_samples():
    """Pre-load sample datasets so the API always has ready demo data."""
    samples_dir = os.path.join(os.path.dirname(__file__), "samples")
    if not os.path.exists(samples_dir):
        return
    for fname in ["ecommerce_sales.csv", "customer_churn.csv"]:
        fpath = os.path.join(samples_dir, fname)
        if os.path.isfile(fpath):
            try:
                with open(fpath, "rb") as f:
                    file_bytes = f.read()
                dataset_id = f"sample-{fname.replace('.csv', '')}"
                with _JOBS_LOCK:
                    _JOBS[dataset_id] = {
                        "status": {
                            "stage": "detecting",
                            "progress": 5,
                            "message": "Loading sample…",
                            "currentStepIndex": 0,
                            "error": None,
                        },
                        "result": None,
                        "filename": fname,
                        "created_at": datetime.now(timezone.utc).isoformat(),
                    }
                _executor.submit(_run_pipeline, dataset_id, file_bytes, fname)
            except Exception as e:
                print(f"Failed to preload sample {fname}: {e}")
