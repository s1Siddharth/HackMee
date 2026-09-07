import os
import io
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from dotenv import load_dotenv

from src.ingestion.loader import DatasetLoader
from src.preprocessing.profiler import DataProfiler
from src.preprocessing.cleaner import DataCleaner
from src.visualization.charts import ChartEngine
from src.visualization.recommendations import VisualizationRecommender
from src.analytics.filters import DataFilter
from src.ai.insight_analyzer import InsightAnalyzer
from src.ai.llm import GroqLLM, _resolve_provider_and_models
from src.ai.prompt_builder import InsightPromptBuilder
from src.analytics.anomaly_detector import AnomalyDetector
from src.ai.chat_assistant import stream_chat

# ─── Load env ────────────────────────────────────────────────────────────────
load_dotenv()

st.set_page_config(
    page_title="HackMee · AI Data Analyst",
    page_icon="📊",
    layout="wide",
)

# ─── Custom CSS: dark glassmorphism theme ─────────────────────────────────────
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    html, body, [class*="css"] { font-family: 'Inter', sans-serif; }

    /* Dark background */
    .stApp { background: linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e); }

    /* Sidebar */
    [data-testid="stSidebar"] {
        background: rgba(255,255,255,0.04);
        border-right: 1px solid rgba(255,255,255,0.08);
    }

    /* KPI cards */
    .kpi-card {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 16px;
        padding: 20px 24px;
        text-align: center;
        backdrop-filter: blur(10px);
        transition: transform .2s, box-shadow .2s;
    }
    .kpi-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 32px rgba(99,102,241,.3);
    }
    .kpi-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .08em;
        color: #a5b4fc;
        margin-bottom: 6px;
    }
    .kpi-value {
        font-size: 2rem;
        font-weight: 700;
        color: #fff;
        line-height: 1.1;
    }
    .kpi-sub {
        font-size: 0.75rem;
        color: #6ee7b7;
        margin-top: 4px;
    }

    /* Section headers */
    .section-header {
        font-size: 1.1rem;
        font-weight: 600;
        color: #c7d2fe;
        margin: 28px 0 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    /* FAQ pills */
    .faq-pill {
        display: inline-block;
        background: rgba(99,102,241,0.18);
        border: 1px solid rgba(99,102,241,0.4);
        border-radius: 20px;
        padding: 5px 14px;
        font-size: 0.78rem;
        color: #c7d2fe;
        margin: 3px;
        cursor: pointer;
        transition: background .2s;
    }
    .faq-pill:hover { background: rgba(99,102,241,0.35); }

    /* Metric styling */
    [data-testid="stMetric"] {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 12px 16px;
    }
    [data-testid="stMetricValue"] { color: #fff !important; font-weight: 700; }
    [data-testid="stMetricLabel"] { color: #a5b4fc !important; font-size: 0.75rem !important; }

    /* Plotly chart backgrounds */
    .js-plotly-plot .plotly { border-radius: 12px; }

    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
        color: #fff !important;
        border: none !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
        transition: opacity .2s !important;
    }
    .stButton > button:hover { opacity: 0.88 !important; }

    /* Chat messages */
    [data-testid="stChatMessage"] {
        background: rgba(255,255,255,0.04) !important;
        border-radius: 12px !important;
        margin-bottom: 6px !important;
    }

    /* Dividers */
    hr { border-color: rgba(255,255,255,0.08) !important; }
    </style>
    """,
    unsafe_allow_html=True,
)


# ─── Helpers ─────────────────────────────────────────────────────────────────

CHART_THEME = dict(
    template="plotly_dark",
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
)


def _dark_fig(fig: go.Figure) -> go.Figure:
    """Apply consistent dark transparent styling to any plotly figure."""
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font_color="#e2e8f0",
        title_font_color="#c7d2fe",
        legend_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=10, r=10, t=40, b=10),
    )
    return fig


def _build_dataset_context(
    df: pd.DataFrame,
    filename: str,
) -> str:
    """Build a rich text summary of the dataset for the AI assistant."""
    lines = [
        f"Filename: {filename}",
        f"Shape: {df.shape[0]:,} rows × {df.shape[1]} columns",
        "",
        "--- Columns & Types ---",
    ]
    for col in df.columns:
        dtype = str(df[col].dtype)
        null_pct = df[col].isna().mean() * 100
        lines.append(f"  {col!r}: {dtype}  (nulls: {null_pct:.1f}%)")

    # Numeric stats
    num_df = df.select_dtypes(include="number")
    if not num_df.empty:
        lines += ["", "--- Numeric Summary ---"]
        desc = num_df.describe().round(2)
        lines.append(desc.to_string())

    # Categorical value counts (top 5 each, max 8 cols)
    cat_df = df.select_dtypes(include=["object", "category", "bool"])
    if not cat_df.empty:
        lines += ["", "--- Categorical Top Values ---"]
        for col in cat_df.columns[:8]:
            top = df[col].value_counts().head(5)
            lines.append(f"  {col}: " + ", ".join(f"{k}({v})" for k, v in top.items()))

    # Sample rows
    lines += ["", "--- Sample Rows (first 5) ---"]
    lines.append(df.head(5).to_string(index=False))

    return "\n".join(lines)


def _auto_kpis(df: pd.DataFrame) -> list[dict]:
    """Pick the most meaningful KPI cards automatically."""
    num_cols = df.select_dtypes(include="number").columns.tolist()
    kpis = []

    # Always: row count
    kpis.append({"label": "Total Records", "value": f"{len(df):,}", "sub": "rows"})

    for col in num_cols[:4]:
        total = df[col].sum()
        mean  = df[col].mean()
        fmt   = lambda v: f"{v:,.0f}" if abs(v) >= 1 else f"{v:.3f}"
        kpis.append({
            "label": col.replace("_", " ").title(),
            "value": fmt(total),
            "sub": f"avg {fmt(mean)}",
        })
        if len(kpis) >= 6:
            break

    return kpis


def _render_kpi_row(kpis: list[dict]) -> None:
    """Render a row of glassmorphism KPI cards."""
    cols = st.columns(len(kpis))
    for c, kpi in zip(cols, kpis):
        with c:
            st.markdown(
                f"""
                <div class="kpi-card">
                    <div class="kpi-label">{kpi['label']}</div>
                    <div class="kpi-value">{kpi['value']}</div>
                    <div class="kpi-sub">{kpi['sub']}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )


def _render_chat_message(content: str) -> None:
    """Render chat message with Claude/DeepSeek-style thinking expander."""
    think_text = ""
    answer_text = content
    for start_tag, end_tag in [("<think>", "</think>"), ("<thinking>", "</thinking>")]:
        if start_tag in content:
            parts = content.split(start_tag, 1)
            before = parts[0].strip()
            if end_tag in parts[1]:
                think_body, after = parts[1].split(end_tag, 1)
                think_text = think_body.strip()
                answer_text = (before + "\n\n" + after).strip() if before else after.strip()
            else:
                think_text = parts[1].strip()
                answer_text = before
            break

    if think_text:
        with st.expander("🧠 Thought Process (Reasoning)", expanded=False):
            st.markdown(f"*{think_text}*")

    if answer_text:
        st.markdown(answer_text)


def _render_auto_dashboard(df: pd.DataFrame) -> None:
    """Render an auto-generated PowerBI-style 2×2 chart dashboard."""
    num_cols = df.select_dtypes(include="number").columns.tolist()
    cat_cols = df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()
    dt_cols  = df.select_dtypes(include=["datetime", "datetimetz"]).columns.tolist()

    charts_rendered = 0

    # Row 1: col A = bar/pie, col B = line/histogram
    col_a, col_b = st.columns(2)

    # Chart 1 — Bar: cat × num
    with col_a:
        if cat_cols and num_cols:
            agg = (
                df.groupby(cat_cols[0], dropna=False)[num_cols[0]]
                .sum()
                .nlargest(15)
                .reset_index()
            )
            fig = px.bar(
                agg, x=cat_cols[0], y=num_cols[0],
                title=f"{num_cols[0]} by {cat_cols[0]}",
                color=num_cols[0],
                color_continuous_scale="Purples",
                **CHART_THEME,
            )
            st.plotly_chart(_dark_fig(fig), use_container_width=True)
            charts_rendered += 1
        elif num_cols:
            fig = px.histogram(
                df, x=num_cols[0], title=f"Distribution of {num_cols[0]}",
                color_discrete_sequence=["#8b5cf6"],
                **CHART_THEME,
            )
            st.plotly_chart(_dark_fig(fig), use_container_width=True)
            charts_rendered += 1

    # Chart 2 — Line or histogram
    with col_b:
        if dt_cols and num_cols:
            line_df = df[[dt_cols[0], num_cols[0]]].dropna().sort_values(dt_cols[0])
            fig = px.line(
                line_df, x=dt_cols[0], y=num_cols[0],
                title=f"{num_cols[0]} over Time",
                color_discrete_sequence=["#6ee7b7"],
                **CHART_THEME,
            )
            fig.update_traces(line_width=2, mode="lines+markers")
            st.plotly_chart(_dark_fig(fig), use_container_width=True)
            charts_rendered += 1
        elif len(num_cols) >= 2:
            fig = px.scatter(
                df.sample(min(2000, len(df)), random_state=42),
                x=num_cols[0], y=num_cols[1],
                title=f"{num_cols[1]} vs {num_cols[0]}",
                color_discrete_sequence=["#f472b6"],
                opacity=0.6,
                **CHART_THEME,
            )
            st.plotly_chart(_dark_fig(fig), use_container_width=True)
            charts_rendered += 1
        elif num_cols:
            col_idx = min(1, len(num_cols) - 1)
            fig = px.histogram(
                df, x=num_cols[col_idx],
                title=f"Distribution of {num_cols[col_idx]}",
                color_discrete_sequence=["#34d399"],
                **CHART_THEME,
            )
            st.plotly_chart(_dark_fig(fig), use_container_width=True)
            charts_rendered += 1

    # Row 2: col C = donut, col D = heatmap or box
    col_c, col_d = st.columns(2)

    # Chart 3 — Donut
    with col_c:
        if cat_cols and num_cols:
            pie_data = (
                df.groupby(cat_cols[0], dropna=False)[num_cols[0]]
                .sum()
                .nlargest(8)
                .reset_index()
            )
            fig = px.pie(
                pie_data, names=cat_cols[0], values=num_cols[0],
                title=f"Share of {num_cols[0]} by {cat_cols[0]}",
                hole=0.45,
                **CHART_THEME,
            )
            fig.update_traces(textfont_color="#fff")
            st.plotly_chart(_dark_fig(fig), use_container_width=True)
            charts_rendered += 1

    # Chart 4 — Correlation heatmap or box
    with col_d:
        num_df = df.select_dtypes(include="number")
        if num_df.shape[1] >= 2:
            corr = num_df.corr().round(2)
            fig = px.imshow(
                corr, text_auto=".2f",
                aspect="auto",
                title="Correlation Heatmap",
                color_continuous_scale="RdBu_r",
                **CHART_THEME,
            )
            st.plotly_chart(_dark_fig(fig), use_container_width=True)
            charts_rendered += 1
        elif cat_cols and num_cols:
            fig = px.box(
                df.sample(min(2000, len(df)), random_state=42),
                x=cat_cols[0], y=num_cols[0],
                title=f"{num_cols[0]} by {cat_cols[0]}",
                color=cat_cols[0],
                **CHART_THEME,
            )
            st.plotly_chart(_dark_fig(fig), use_container_width=True)
            charts_rendered += 1

    if charts_rendered == 0:
        st.info("Not enough numeric/categorical columns to auto-generate charts.")


def _faq_questions(df: pd.DataFrame) -> list[str]:
    """Generate FAQ-style demo questions based on the dataset columns."""
    num_cols = df.select_dtypes(include="number").columns.tolist()
    cat_cols = df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()
    q = [
        "Summarize this dataset in 3 bullet points",
        "What are the key insights from this data?",
        "Which records should I pay attention to?",
    ]
    if num_cols:
        q.append(f"What is the average {num_cols[0]}?")
        q.append(f"Which rows have the highest {num_cols[0]}?")
    if cat_cols:
        q.append(f"What are the top values in {cat_cols[0]}?")
        q.append(f"How is the data distributed across {cat_cols[0]}?")
    if len(num_cols) >= 2:
        q.append(f"Is there a relationship between {num_cols[0]} and {num_cols[1]}?")
    q.append("Are there any anomalies or outliers?")
    q.append("What business recommendations can you make?")
    return q[:8]  # max 8 pills


# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    """Run the HackMee AI Data Analyst dashboard."""

    # ── Session state ────────────────────────────────────────────────────────
    defaults = {
        "cleaned_df": None,
        "cleaning_report": None,
        "cleaning_comparison": None,
        "uploaded_filename": None,
        "ai_insights": None,
        "chat_history": [],
        "chat_open": False,
        "pending_question": None,
        "dataset_context": None,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v

    # ── Header ───────────────────────────────────────────────────────────────
    st.markdown(
        """
        <div style="padding: 10px 0 4px">
            <h1 style="margin:0; font-size:2rem; font-weight:700;
                background: linear-gradient(90deg,#a5b4fc,#6ee7b7);
                -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
                📊 HackMee · AI Data Analyst
            </h1>
            <p style="margin:4px 0 0; color:#94a3b8; font-size:.9rem;">
                Upload a dataset for instant PowerBI-style analytics + AI insights
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ── Sidebar ──────────────────────────────────────────────────────────────
    st.sidebar.header("📁 Dataset")
    uploaded_file = st.sidebar.file_uploader(
        "Upload CSV / Excel / JSON",
        type=["csv", "xlsx", "json"],
    )

    st.sidebar.divider()
    st.sidebar.markdown("### 🤖 AI Model & Status")

    active_api_key = (
        os.getenv("NVIDIA_API_KEY")
        or os.getenv("OPENROUTER_API_KEY")
        or os.getenv("GROQ_API_KEY", "")
    ).strip()

    if active_api_key:
        provider, _, model_list = _resolve_provider_and_models(active_api_key)
        st.sidebar.success(f"✅ **{provider}** Key Loaded")
        selected_model = st.sidebar.selectbox(
            "Active Model",
            options=model_list,
            index=0,
            help="Select model for AI Insights and Data Chat"
        )
        if st.sidebar.button("🔌 Test Connection", use_container_width=True):
            try:
                llm = GroqLLM(api_key=active_api_key, model=selected_model)
                with st.spinner(f"Testing {selected_model}…"):
                    resp = llm.generate("Say Ready in 1 word")
                st.sidebar.success(f"✅ {provider} responded: {resp.strip()}")
            except Exception as exc:
                st.sidebar.error(f"❌ {exc}")
    else:
        st.sidebar.warning("⚠️ No API key found in .env")
        manual_key = st.sidebar.text_input(
            "Enter API Key manually",
            type="password",
            placeholder="nvapi-... or sk-or-...",
        )
        if manual_key.strip():
            active_api_key = manual_key.strip()
            if active_api_key.startswith("nvapi-"):
                os.environ["NVIDIA_API_KEY"] = active_api_key
            else:
                os.environ["OPENROUTER_API_KEY"] = active_api_key
            st.rerun()
        selected_model = None

    # ── No file uploaded ─────────────────────────────────────────────────────
    if uploaded_file is None:
        st.markdown(
            """
            <div style="margin-top:60px; text-align:center; color:#94a3b8;">
                <div style="font-size:3rem; margin-bottom:16px;">📂</div>
                <h2 style="color:#c7d2fe; margin-bottom:8px;">Upload a dataset to begin</h2>
                <p>Supports CSV, Excel (.xlsx), and JSON files</p>
                <div style="display:flex; gap:16px; justify-content:center;
                     flex-wrap:wrap; margin-top:32px; color:#64748b; font-size:.85rem;">
                    <span>🧹 Auto data cleaning</span>
                    <span>📊 Interactive dashboard</span>
                    <span>🔍 Anomaly detection</span>
                    <span>🤖 AI-powered insights</span>
                    <span>💬 Data-aware chat</span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        return

    # ── Load dataset ─────────────────────────────────────────────────────────
    try:
        df = DatasetLoader.load(uploaded_file)
    except ValueError as exc:
        st.error(str(exc))
        return

    st.success(f"✅ Loaded **{uploaded_file.name}** — {len(df):,} rows × {df.shape[1]} columns")

    profiler       = DataProfiler(df)
    metrics        = profiler.get_basic_metrics()
    column_types   = profiler.get_column_types()
    quality_score  = profiler.calculate_quality_score()

    # ── Reset state on new file ──────────────────────────────────────────────
    if st.session_state["uploaded_filename"] != uploaded_file.name:
        st.session_state["uploaded_filename"]  = uploaded_file.name
        st.session_state["cleaned_df"]         = None
        st.session_state["cleaning_report"]    = None
        st.session_state["cleaning_comparison"]= None
        st.session_state["ai_insights"]        = None
        st.session_state["chat_history"]       = []
        st.session_state["dataset_context"]    = None

    # ══════════════════════════════════════════════════════════════════════════
    # TAB LAYOUT
    # ══════════════════════════════════════════════════════════════════════════
    tab_overview, tab_clean, tab_dashboard, tab_explore, tab_insights, tab_chat = st.tabs([
        "📋 Overview",
        "🧹 Clean",
        "📊 Dashboard",
        "🔎 Explore",
        "🤖 AI Insights",
        "💬 AI Chat",
    ])

    # ══════════════════════════════════════════════════════════════════════════
    # TAB 1 — OVERVIEW
    # ══════════════════════════════════════════════════════════════════════════
    with tab_overview:
        st.markdown('<div class="section-header">📈 Dataset Health</div>', unsafe_allow_html=True)

        m1, m2, m3, m4, m5 = st.columns(5)
        with m1: st.metric("Rows",      f"{metrics['rows']:,}")
        with m2: st.metric("Columns",   f"{metrics['columns']:,}")
        with m3: st.metric("Missing",   f"{metrics['missing_percentage']:.1f}%")
        with m4: st.metric("Duplicates",f"{metrics['duplicate_percentage']:.1f}%")
        with m5: st.metric("Quality",   f"{quality_score}/100")

        st.markdown('<div class="section-header">👁 Raw Preview</div>', unsafe_allow_html=True)
        st.dataframe(df.head(100), use_container_width=True, height=300)

        col_l, col_r = st.columns(2)
        with col_l:
            st.markdown('<div class="section-header">🗂 Column Types</div>', unsafe_allow_html=True)
            m_a, m_b, m_c = st.columns(3)
            with m_a: st.metric("Numeric",     len(column_types["numeric"]))
            with m_b: st.metric("Categorical", len(column_types["categorical"]))
            with m_c: st.metric("Datetime",    len(column_types["datetime"]))
            st.dataframe(
                {"Column": df.columns, "Type": [str(d) for d in df.dtypes]},
                use_container_width=True, hide_index=True,
            )

        with col_r:
            st.markdown('<div class="section-header">❓ Missing Values</div>', unsafe_allow_html=True)
            miss = df.isna().sum().reset_index()
            miss.columns = ["Column", "Missing"]
            miss["Missing %"] = (miss["Missing"] / len(df) * 100).round(2)
            st.dataframe(miss, use_container_width=True, hide_index=True)

        st.markdown('<div class="section-header">📊 Numeric Statistics</div>', unsafe_allow_html=True)
        num_summary = profiler.get_numeric_summary()
        if num_summary.empty:
            st.info("No numerical columns detected.")
        else:
            st.dataframe(num_summary, use_container_width=True, hide_index=True)

        # Quality alerts
        st.markdown('<div class="section-header">⚠️ Quality Alerts</div>', unsafe_allow_html=True)
        alerts = 0
        if metrics["missing_percentage"] > 0:
            st.warning(f"Missing values: {metrics['missing_percentage']:.2f}% of all cells")
            alerts += 1
        if metrics["duplicate_percentage"] > 0:
            st.warning(f"{metrics['duplicate_rows']:,} duplicate rows detected")
            alerts += 1
        for c in profiler.get_constant_columns():
            st.warning(f"Constant column: '{c}'")
            alerts += 1
        if alerts == 0:
            st.success("No major data-quality issues detected.")

    # ══════════════════════════════════════════════════════════════════════════
    # TAB 2 — CLEAN
    # ══════════════════════════════════════════════════════════════════════════
    with tab_clean:
        st.markdown('<div class="section-header">🧹 Automated Data Cleaning</div>', unsafe_allow_html=True)
        st.write("Choose operations and click **Clean Dataset** to create an analysis-ready version.")

        c1, c2 = st.columns(2)
        with c1:
            rm_dup   = st.checkbox("Remove duplicate rows",         value=True, key="rm_dup")
            std_name = st.checkbox("Standardize column names",      value=True, key="std_name")
            conv_dt  = st.checkbox("Detect & convert date columns", value=True, key="conv_dt")
        with c2:
            fill_mv  = st.checkbox("Fill missing values",           value=True, key="fill_mv")
            rm_const = st.checkbox("Remove constant columns",       value=True, key="rm_const")

        if st.button("🧹 Clean Dataset", type="primary", key="clean_btn"):
            try:
                cleaner    = DataCleaner(df)
                cleaned_df = cleaner.clean(
                    remove_duplicates  = rm_dup,
                    standardize_names  = std_name,
                    convert_dates      = conv_dt,
                    fill_missing       = fill_mv,
                    remove_constants   = rm_const,
                )
                st.session_state["cleaned_df"]          = cleaned_df
                st.session_state["cleaning_report"]     = cleaner.get_cleaning_report()
                st.session_state["cleaning_comparison"] = cleaner.get_comparison()
                st.session_state["ai_insights"]         = None
                # Build dataset context for chat
                st.session_state["dataset_context"] = _build_dataset_context(
                    cleaned_df, uploaded_file.name
                )
                st.success("✅ Cleaning complete! Head to the **Dashboard** tab.")
            except Exception as exc:
                st.error(f"Cleaning failed: {exc}")

        if st.session_state["cleaned_df"] is not None:
            comp   = st.session_state["cleaning_comparison"]
            report = st.session_state["cleaning_report"]

            st.markdown('<div class="section-header">📊 Before vs After</div>', unsafe_allow_html=True)
            b1, b2, b3, b4 = st.columns(4)
            with b1: st.metric("Rows",     f"{comp['cleaned_rows']:,}",
                                delta=comp["cleaned_rows"] - comp["original_rows"])
            with b2: st.metric("Columns",  f"{comp['cleaned_columns']:,}",
                                delta=comp["cleaned_columns"] - comp["original_columns"])
            with b3: st.metric("Missing",  f"{comp['cleaned_missing']:,}",
                                delta=comp["original_missing"] - comp["cleaned_missing"])
            with b4: st.metric("Dupes",    f"{comp['cleaned_duplicates']:,}",
                                delta=comp["original_duplicates"] - comp["cleaned_duplicates"])

            st.markdown('<div class="section-header">📋 Operations Log</div>', unsafe_allow_html=True)
            if report.empty:
                st.info("No cleaning operations were needed.")
            else:
                st.dataframe(report, use_container_width=True, hide_index=True)

            st.markdown('<div class="section-header">✨ Cleaned Dataset Preview</div>', unsafe_allow_html=True)
            st.dataframe(st.session_state["cleaned_df"].head(100),
                         use_container_width=True, height=300)

            csv_bytes = (
                st.session_state["cleaned_df"]
                .to_csv(index=False)
                .encode("utf-8")
            )
            st.download_button(
                "⬇️ Download Cleaned CSV",
                data=csv_bytes,
                file_name="cleaned_dataset.csv",
                mime="text/csv",
            )

    # ══════════════════════════════════════════════════════════════════════════
    # TAB 3 — DASHBOARD  (PowerBI-style)
    # ══════════════════════════════════════════════════════════════════════════
    with tab_dashboard:
        if st.session_state["cleaned_df"] is None:
            st.info("🧹 Clean your dataset first (go to the **Clean** tab) to unlock the dashboard.")
        else:
            dash_df = st.session_state["cleaned_df"]

            # KPI row
            st.markdown('<div class="section-header">📌 Key Performance Indicators</div>',
                        unsafe_allow_html=True)
            _render_kpi_row(_auto_kpis(dash_df))

            st.markdown('<div class="section-header">📊 Auto-Generated Charts</div>',
                        unsafe_allow_html=True)
            _render_auto_dashboard(dash_df)

            # Anomaly summary card
            st.markdown('<div class="section-header">🚨 Anomaly Overview</div>',
                        unsafe_allow_html=True)
            try:
                detector = AnomalyDetector(dash_df)
                with st.spinner("Running anomaly detection…"):
                    _, summary = detector.analyze()
                a1, a2, a3, a4 = st.columns(4)
                with a1: st.metric("Rows Analyzed",  f"{summary['total_rows']:,}")
                with a2: st.metric("IQR Outliers",   f"{summary['iqr']['anomaly_count']:,}")
                with a3: st.metric("ML Anomalies",   f"{summary['isolation_forest']['anomaly_count']:,}")
                with a4: st.metric("Combined Rate",  f"{summary['combined_anomaly_percentage']:.1f}%")
            except Exception as exc:
                st.warning(f"Anomaly detection skipped: {exc}")

    # ══════════════════════════════════════════════════════════════════════════
    # TAB 4 — EXPLORE
    # ══════════════════════════════════════════════════════════════════════════
    with tab_explore:
        if st.session_state["cleaned_df"] is None:
            st.info("🧹 Clean your dataset first.")
        else:
            explore_df = st.session_state["cleaned_df"].copy()

            # Search & filter
            st.markdown('<div class="section-header">🔍 Search & Filter</div>', unsafe_allow_html=True)
            search_text = st.text_input("Search across all columns",
                                        placeholder="e.g. Chennai, Laptop…")
            if search_text.strip():
                explore_df = DataFilter(explore_df).global_search(search_text)

            cat_cols_e = explore_df.select_dtypes(include=["object","category","bool"]).columns.tolist()
            num_cols_e = explore_df.select_dtypes(include="number").columns.tolist()

            if cat_cols_e:
                sel_cat = st.selectbox("Filter by category column", ["None"] + cat_cols_e)
                if sel_cat != "None":
                    vals = explore_df[sel_cat].dropna().unique().tolist()
                    chosen = st.multiselect(f"Select {sel_cat} values", vals)
                    if chosen:
                        explore_df = DataFilter(explore_df).categorical_filter(sel_cat, chosen)

            if num_cols_e:
                sel_num = st.selectbox("Numeric filter column", ["None"] + num_cols_e)
                if sel_num != "None":
                    op = st.selectbox("Operator", [">",">=","<","<=","==","!="])
                    fval = st.number_input("Value", value=float(explore_df[sel_num].mean()))
                    if st.button("Apply Filter", key="apply_filter_btn"):
                        explore_df = DataFilter(explore_df).numeric_filter(sel_num, op, fval)

            st.metric("Matching Records", f"{len(explore_df):,}")
            st.dataframe(explore_df.head(200), use_container_width=True, height=350)

            # Chart explorer
            st.markdown('<div class="section-header">📈 Chart Explorer</div>', unsafe_allow_html=True)
            chart_engine = ChartEngine(explore_df)
            chart_type = st.selectbox("Chart type", [
                "Bar Chart", "Line Chart", "Scatter Plot",
                "Histogram", "Pie / Donut", "Box Plot", "Correlation Heatmap",
            ])

            all_cols = explore_df.columns.tolist()
            num_c = explore_df.select_dtypes(include="number").columns.tolist()
            cat_c = explore_df.select_dtypes(include=["object","category","bool"]).columns.tolist()
            dt_c  = explore_df.select_dtypes(include=["datetime","datetimetz"]).columns.tolist()

            try:
                fig = None
                if chart_type == "Bar Chart" and cat_c and num_c:
                    ca, cb = st.columns(2)
                    x = ca.selectbox("Category (X)", cat_c, key="bar_x")
                    y = cb.selectbox("Value (Y)", num_c, key="bar_y")
                    fig = chart_engine.bar_chart(x, y)

                elif chart_type == "Line Chart" and num_c:
                    x_opts = dt_c or all_cols
                    ca, cb = st.columns(2)
                    x = ca.selectbox("X-axis", x_opts, key="line_x")
                    y = cb.selectbox("Y-axis", num_c, key="line_y")
                    fig = chart_engine.line_chart(x, y)

                elif chart_type == "Scatter Plot" and len(num_c) >= 2:
                    ca, cb = st.columns(2)
                    x = ca.selectbox("X-axis", num_c, key="scat_x")
                    y = cb.selectbox("Y-axis", num_c, index=1, key="scat_y")
                    fig = chart_engine.scatter_chart(x, y)

                elif chart_type == "Histogram" and num_c:
                    col = st.selectbox("Column", num_c, key="hist_col")
                    fig = chart_engine.histogram(col)

                elif chart_type == "Pie / Donut" and cat_c and num_c:
                    ca, cb = st.columns(2)
                    names  = ca.selectbox("Category", cat_c, key="pie_cat")
                    values = cb.selectbox("Value", num_c, key="pie_val")
                    fig = chart_engine.pie_chart(names, values)

                elif chart_type == "Box Plot" and num_c:
                    y = st.selectbox("Numeric column", num_c, key="box_y")
                    x = None
                    if cat_c and st.checkbox("Group by category", value=True):
                        x = st.selectbox("Category", cat_c, key="box_x")
                    fig = chart_engine.box_plot(x, y)

                elif chart_type == "Correlation Heatmap" and len(num_c) >= 2:
                    fig = chart_engine.correlation_heatmap()

                if fig:
                    st.plotly_chart(_dark_fig(fig), use_container_width=True)
                else:
                    st.info("Not enough columns of the required type for this chart.")

            except Exception as exc:
                st.error(f"Chart error: {exc}")

    # ══════════════════════════════════════════════════════════════════════════
    # TAB 5 — AI INSIGHTS
    # ══════════════════════════════════════════════════════════════════════════
    with tab_insights:
        if st.session_state["cleaned_df"] is None:
            st.info("🧹 Clean your dataset first.")
        else:
            insight_df = st.session_state["cleaned_df"]

            try:
                analyzer = InsightAnalyzer(insight_df)
                evidence = analyzer.generate_evidence()
            except Exception as exc:
                st.error(f"Evidence generation failed: {exc}")
                evidence = None

            if evidence:
                if st.button("✨ Generate AI Insights", type="primary", key="gen_insights_btn"):
                    if not active_api_key:
                        st.warning("No API key found. Add NVIDIA_API_KEY or OPENROUTER_API_KEY to .env.")
                    else:
                        try:
                            prompt = InsightPromptBuilder.build(evidence)
                            llm = GroqLLM(api_key=active_api_key, model=selected_model)
                            with st.spinner("🤖 Analyzing your dataset…"):
                                response = llm.generate(prompt)
                            st.session_state["ai_insights"] = response
                        except Exception as exc:
                            st.error(f"AI insight generation failed: {exc}")

                if st.session_state["ai_insights"]:
                    st.markdown("### 💡 AI Analysis")
                    st.markdown(st.session_state["ai_insights"])
                    st.divider()

                with st.expander("📊 Analytical Evidence — Numerical"):
                    st.json(evidence["numerical_summary"])
                with st.expander("📊 Analytical Evidence — Categorical"):
                    st.json(evidence["categorical_summary"])
                with st.expander("🔗 Strong Correlations"):
                    if evidence["correlations"]:
                        st.json(evidence["correlations"])
                    else:
                        st.info("No strong correlations detected.")
                with st.expander("🚨 Potential Outliers"):
                    if evidence["outliers"]:
                        st.json(evidence["outliers"])
                    else:
                        st.info("No significant outliers detected.")

    # ══════════════════════════════════════════════════════════════════════════
    # TAB 6 — AI CHAT
    # ══════════════════════════════════════════════════════════════════════════
    with tab_chat:
        dataset_loaded = st.session_state["cleaned_df"] is not None
        ctx = st.session_state.get("dataset_context")

        if not dataset_loaded:
            st.info("🧹 Clean your dataset first so the AI assistant knows about your data.")
        else:
            st.markdown(
                """
                <div style="background:rgba(99,102,241,.12); border:1px solid rgba(99,102,241,.3);
                     border-radius:12px; padding:14px 18px; margin-bottom:16px; color:#c7d2fe;">
                    💡 <strong>Data-Aware AI Assistant</strong> — I know your dataset's columns,
                    statistics, and sample rows. Ask me anything about your data!
                </div>
                """,
                unsafe_allow_html=True,
            )

            # FAQ pills
            st.markdown("**💬 Suggested questions:**")
            faq_qs = _faq_questions(st.session_state["cleaned_df"])
            pill_cols = st.columns(4)
            for i, q in enumerate(faq_qs):
                with pill_cols[i % 4]:
                    if st.button(q, key=f"faq_{i}", use_container_width=True):
                        st.session_state["pending_question"] = q

            st.divider()

            # Chat history
            for msg in st.session_state["chat_history"]:
                with st.chat_message(msg["role"]):
                    st.markdown(msg["content"])

            # Determine next user message (FAQ pill or typed)
            typed_msg  = st.chat_input("Ask anything about your data…")
            pending    = st.session_state.pop("pending_question", None)
            user_input = pending or typed_msg

            if user_input:
                if not active_api_key:
                    st.warning("No Groq API key. Add GROQ_API_KEY to .env or enter it in the sidebar.")
                else:
                    # Display user message
                    st.session_state["chat_history"].append({"role": "user", "content": user_input})
                    with st.chat_message("user"):
                        st.markdown(user_input)

                    # Stream assistant response
                    with st.chat_message("assistant"):
                        thinking_placeholder = st.empty()
                        answer_placeholder   = st.empty()

                        full_text   = ""
                        final_answer = ""
                        for token in stream_chat(
                            api_key        = active_api_key,
                            message        = user_input,
                            model          = _ENV_MODEL,
                            dataset_context = ctx,
                        ):
                            full_text += token
                            think_start = full_text.find("<thinking>")
                            think_end   = full_text.find("</thinking>")

                            if think_start != -1 and think_end == -1:
                                thinking_placeholder.caption(
                                    f"🧠 *Thinking…* {full_text[think_start+10:]}"
                                )
                            elif think_end != -1:
                                thinking_placeholder.caption(
                                    f"🧠 *{full_text[think_start+10:think_end]}*"
                                )
                                after = full_text[think_end + 11:].strip()
                                if after:
                                    answer_placeholder.markdown(after)
                            else:
                                answer_placeholder.markdown(full_text)

                        thinking_placeholder.empty()
                        final_answer = (
                            full_text.split("</thinking>")[-1].strip()
                            if "</thinking>" in full_text
                            else full_text
                        )
                        answer_placeholder.markdown(final_answer)

                    st.session_state["chat_history"].append(
                        {"role": "assistant", "content": final_answer}
                    )

            if st.session_state["chat_history"]:
                if st.button("🗑 Clear Chat", key="clear_chat_btn"):
                    st.session_state["chat_history"] = []
                    st.rerun()


if __name__ == "__main__":
    main()