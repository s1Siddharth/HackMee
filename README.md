<div align="center">

# 🔮 HackMee
### *The Autonomous Intelligence Layer for Raw Tabular Data*

**Turn messy spreadsheets (`.csv`, `.xlsx`, `.json`) into self-healed datasets, high-impact visualizations, and executive AI narratives in seconds.**

<br/>

[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Bundler-Vite%206-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Styles-Tailwind%20v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![NVIDIA NIM](https://img.shields.io/badge/AI-NVIDIA%20NIM%20%7C%20Groq-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://build.nvidia.com)

</div>

---

## ⚡ Core Capabilities

<table>
<tr>
<td width="33%" valign="top">

### 🪄 Automated Data Cleaning
*Self-healing tabular pipelines*
- 🧹 Smart deduplication & whitespace normalization
- 🕒 Automatic date detection across diverse formats
- 🧪 Median & mode missing value imputation
- ⚖️ Before vs. After cleaning diff viewer

</td>
<td width="33%" valign="top">

### 🧬 Deep Dataset Profiling
*Comprehensive schema intelligence*
- 🏆 0–100 Data Quality Health Score
- 🏷️ Semantic column classification (numeric/categorical/date)
- 📊 Instant distribution & cardinality metrics
- ⚠️ Automated null ratio & anomaly alerts

</td>
<td width="33%" valign="top">

### 🎛️ Dynamic Slicing & Filtering
*Multi-dimensional data exploration*
- 🔍 Instant global keyword search
- 🎯 Dynamic categorical multi-select slicers
- 📐 Numeric range & condition filters
- ⚡ Live recalculation of visual statistics

</td>
</tr>
<tr>
<td width="33%" valign="top">

### 🚨 ML Anomaly Detection
*Dual-layer statistical screening*
- 📐 IQR statistical outlier boundary flags
- 🤖 Scikit-Learn Isolation Forest screening
- 🎯 Extreme value tagging and distribution impact
- 🛡️ Data drift & skewness diagnostics

</td>
<td width="33%" valign="top">

### 📈 Interactive Visual Studio
*High-performance reactive rendering*
- 📊 Dynamic Recharts (Bar, Line, Scatter, Area)
- 🌡️ Interactive Pearson Correlation Heatmap
- 💡 Automatic chart recommendation heuristics
- 📑 High-resolution PDF & PNG report export

</td>
<td width="33%" valign="top">

### 🧠 Conversational AI Analyst
*Grounded executive narratives*
- 📝 Structured Executive Summaries & Recommendations
- 💬 SSE streaming chat with live dataset context
- 💭 Transparent `<thinking>` reasoning display
- ⛓️ Tri-tier fallback (NVIDIA ➔ Groq ➔ OpenRouter)

</td>
</tr>
</table>

---

## 🔄 How HackMee Works

```mermaid
flowchart LR
    subgraph S1 ["1️⃣ Ingestion"]
        A["📁 Raw Files<br>CSV / XLSX / JSON"]
    end

    subgraph S2 ["2️⃣ Autonomous Healing"]
        B["🪄 Profile & Clean<br>Impute • Dedupe • Typecast"]
    end

    subgraph S3 ["3️⃣ Deep Analytics"]
        C["📊 Statistical Engine<br>Heatmaps • Outliers • Charts"]
    end

    subgraph S4 ["4️⃣ AI Synthesis"]
        D["🧠 Executive Narratives<br>Streaming Chat & Insights"]
    end

    A ==> B ==> C ==> D

    style S1 fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
    style S2 fill:#0f172a,stroke:#fbbf24,stroke-width:2px,color:#f8fafc
    style S3 fill:#0f172a,stroke:#34d399,stroke-width:2px,color:#f8fafc
    style S4 fill:#0f172a,stroke:#c084fc,stroke-width:2px,color:#f8fafc
```

---

## 🏛️ Architecture Flow

```mermaid
flowchart TD
    User(["👤 User / Analyst"])

    subgraph UI ["🖥️ Reactive Frontend (Port 5173)"]
        Dropzone["📥 Drag & Drop Upload"]
        Dashboard["📊 Visual Dashboard & Diffs"]
        ChatDrawer["💬 Streaming AI Assistant"]
    end

    subgraph Core ["⚡ FastAPI Analytics Backend (Port 8000)"]
        Router["🚪 REST & SSE Gateway"]
        Profiler["🧬 Data Profiler & Cleaner"]
        Math["🚨 Anomaly & Correlation Engine"]
        EvidenceGen["📋 Evidence JSON Grounder"]
    end

    subgraph LLMChain ["🧠 Multi-Provider AI Fallback Chain"]
        NVIDIA["🟢 NVIDIA NIM (Llama 3.2 11B / Nemotron)"]
        Groq["🟠 Groq Cloud (Llama 3.3 70B)"]
        OpenRouter["🟣 OpenRouter (Minimax / Free Tier)"]
    end

    User -->|"Uploads dataset"| Dropzone
    Dropzone -->|"POST /upload"| Router
    Router --> Profiler --> Math --> EvidenceGen
    EvidenceGen -->|"Grounded Evidence"| NVIDIA
    NVIDIA -.->|"Auto Fallback"| Groq -.->|"Auto Fallback"| OpenRouter
    
    EvidenceGen -->|"Payload"| Dashboard
    ChatDrawer <-->|"POST /chat/stream (SSE)"| Router

    style UI fill:#090d16,stroke:#38bdf8,stroke-width:1.5px,color:#e2e8f0
    style Core fill:#090d16,stroke:#34d399,stroke-width:1.5px,color:#e2e8f0
    style LLMChain fill:#090d16,stroke:#c084fc,stroke-width:1.5px,color:#e2e8f0
```

---

## 🚀 Quick Start

Get the full platform running locally in 2 minutes:

### 1️⃣ Backend Setup

```bash
cd Backend

# Install dependencies using uv
uv sync

# Configure your API key (NVIDIA, Groq, or OpenRouter)
cp .env.example .env

# Launch FastAPI backend
uv run uvicorn api:app --reload --port 8000
```
> 📍 Backend runs on **`http://127.0.0.1:8000`** (Swagger docs at `/docs`)

---

### 2️⃣ Frontend Setup

```bash
cd Frontend

# Install node packages
npm install

# Start Vite dev server
npm run dev
```
> 📍 Open **`http://localhost:5173`** in your browser!

---

## 🧰 Technology Stack

| Domain | Tech | Role in Platform |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | High-speed reactive component hierarchy |
| **Tooling** | Vite 6 | Sub-second Hot Module Replacement (HMR) & bundling |
| **Design** | TailwindCSS v4 | Sleek dark-mode aesthetic with glassmorphism |
| **Visuals** | Recharts & Plotly | Interactive heatmaps, bar charts, scatter plots |
| **State** | Zustand | Lightweight client-side store |
| **Backend** | FastAPI (Python 3.11+) | Asynchronous REST & Server-Sent Events (SSE) |
| **Data Engine**| Pandas, NumPy, Scikit-Learn | Schema profiling, KNN/median cleaning, IQR anomalies |
| **AI Inference**| NVIDIA NIM, Groq, OpenRouter | Multi-model fallback chain for zero-hallucination analysis |
| **Export** | jsPDF & html2canvas | Executive PDF & PNG report generator |

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/upload` | Ingests `.csv`, `.xlsx`, or `.json` and triggers background pipeline |
| `GET` | `/status/{id}` | Live poll stage (`detecting` ➔ `cleaning` ➔ `analyzing` ➔ `done`) |
| `GET` | `/analysis/{id}`| Retrieves complete analysis JSON (summary, charts, heatmap, diffs) |
| `GET` | `/history` | Returns previous dataset sessions and health scores |
| `POST` | `/chat/stream` | Streams conversational AI tokens with `<thinking>` reasoning blocks |

---

## 📂 Project Organization

```
HackMee/
├── 📁 Backend/               # Python & FastAPI Engine
│   ├── 📁 src/
│   │   ├── 📁 ai/            # Multi-provider LLM client & streaming chat
│   │   ├── 📁 analytics/     # Anomaly detector & dynamic filters
│   │   ├── 📁 ingestion/     # File loaders (.csv, .xlsx, .json)
│   │   ├── 📁 preprocessing/ # Automated profiler & cleaner
│   │   └── 📁 visualization/ # Chart generation logic
│   ├── api.py               # Main FastAPI server entrypoint
│   └── pyproject.toml       # Python package configuration
│
├── 📁 Frontend/              # React 19 + Vite Dashboard
│   ├── 📁 src/
│   │   ├── 📁 components/    # Reusable UI (Charts, Chat, Stepper, Table, Export)
│   │   ├── 📁 pages/         # Dashboard, Upload, Processing, Landing
│   │   └── 📁 store/         # Zustand global state stores
│   └── package.json         # Node.js dependencies
│
└── README.md                # Project documentation
```

---

## 📜 License

Distributed under the **MIT License**. Free for research, personal, and commercial usage.

<div align="center">
  <sub>Engineered with ⚡ for automated data intelligence.</sub>
</div>