<div align="center">

# ⚡ HackMee
### *Automated AI Data Analyst Dashboard*

Turn raw datasets (`.csv`, `.xlsx`, `.json`) into clean data, interactive charts, and executive AI insights in seconds.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Styling-TailwindCSS%20v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![AI](https://img.shields.io/badge/AI-NVIDIA%20%7C%20Groq%20%7C%20OpenRouter-76B900?style=flat-square)](https://build.nvidia.com)

</div>

---

## 🎯 How It Works

Upload a spreadsheet, and HackMee automatically handles the entire analysis lifecycle:

```mermaid
flowchart LR
    A["📁 1. Upload Data<br>(CSV / Excel / JSON)"] --> B["🧹 2. Profile & Clean<br>(Impute nulls, fix dates)"]
    B --> C["📊 3. Analyze & Visualize<br>(Charts, correlations, outliers)"]
    C --> D["🤖 4. AI Insights & Chat<br>(Executive summary & streaming AI)"]

    style A fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0369a1
    style B fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style C fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#15803d
    style D fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#6b21a8
```

---

## 🏗️ System Architecture

A clean, modern decoupled architecture connecting a React frontend with a high-speed FastAPI backend and multi-provider AI:

```mermaid
flowchart TD
    subgraph Frontend ["🖥️ React + Vite Frontend (Port 5173)"]
        UI["User Interface & Upload"]
        Dash["Interactive Charts & Data Diff"]
        Chat["AI Assistant Drawer (SSE Stream)"]
    end

    subgraph Backend ["⚡ FastAPI Backend (Port 8000)"]
        API["REST API & SSE Gateway"]
        Clean["Profiler & Cleaner Engine"]
        Analytics["Statistical & Anomaly Engine"]
    end

    subgraph AI ["🧠 Multi-Provider AI Fallback"]
        NVIDIA["NVIDIA NIM (Primary)"]
        Groq["Groq Llama 3.3 (Fallback 1)"]
        OpenRouter["OpenRouter (Fallback 2)"]
    end

    UI -->|"1. Upload file"| API
    API --> Clean --> Analytics
    Analytics -->|"Evidence JSON"| NVIDIA
    NVIDIA -.->|"Fallback"| Groq -.->|"Fallback"| OpenRouter
    
    API -->|"2. Analysis JSON"| Dash
    Chat <-->|"3. Stream tokens"| API

    style Frontend fill:#f8fafc,stroke:#64748b,stroke-width:1.5px
    style Backend fill:#f0fdf4,stroke:#22c55e,stroke-width:1.5px
    style AI fill:#faf5ff,stroke:#a855f7,stroke-width:1.5px
```

---

## 🚀 Quick Start

Run both the frontend and backend in less than a minute.

### 1. Backend (FastAPI)

```bash
cd Backend

# 1. Install dependencies
uv sync

# 2. Add your free API key in .env (NVIDIA, Groq, or OpenRouter)
cp .env.example .env

# 3. Start server (runs on http://127.0.0.1:8000)
uv run uvicorn api:app --reload --port 8000
```

### 2. Frontend (React + Vite)

```bash
cd Frontend

# 1. Install dependencies
npm install

# 2. Start dev server (runs on http://localhost:5173)
npm run dev
```

> 💡 Open **[http://localhost:5173](http://localhost:5173)** in your browser to use the app!

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite | Fast, modern interactive UI |
| **Styling** | TailwindCSS v4, Lucide Icons | Responsive glassmorphic dark & light mode |
| **Charts** | Recharts, Plotly | Interactive bar, line, scatter & correlation heatmaps |
| **State** | Zustand | Simple and lightweight global state |
| **Backend** | FastAPI (Python 3.11+) | Async REST API & Server-Sent Events (SSE) |
| **Data Engine** | Pandas, NumPy, Scikit-learn | Profiling, cleaning, IQR outlier detection |
| **AI / LLMs** | NVIDIA NIM, Groq, OpenRouter | Llama 3.2, Llama 3.3, Nemotron with auto-fallback |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/upload` | Upload CSV / Excel / JSON dataset for processing |
| `GET` | `/status/{id}` | Check pipeline progress (`detecting` ➔ `cleaning` ➔ `analyzing` ➔ `done`) |
| `GET` | `/analysis/{id}` | Get full dataset summary, charts, outliers, and metrics |
| `GET` | `/history` | List all processed datasets |
| `POST` | `/chat/stream` | Stream AI assistant answers using dataset context |
| `GET` | `/docs` | Interactive Swagger API documentation |

---

## 📂 Project Structure

```
HackMee/
├── 📁 Backend/               # FastAPI backend & data processing
│   ├── 📁 src/
│   │   ├── 📁 ai/            # LLM prompts, fallback client & streaming chat
│   │   ├── 📁 analytics/     # Anomaly detector & filters
│   │   ├── 📁 ingestion/     # File loaders (.csv, .xlsx, .json)
│   │   ├── 📁 preprocessing/ # Profiler & cleaner
│   │   └── 📁 visualization/ # Chart generators
│   ├── api.py               # Main FastAPI server
│   └── pyproject.toml       # Backend dependencies
│
├── 📁 Frontend/              # React + Vite application
│   ├── 📁 src/
│   │   ├── 📁 components/    # Reusable UI (Charts, Chat, Stepper, Table)
│   │   ├── 📁 pages/         # Dashboard, Upload, Processing, Landing
│   │   └── 📁 store/         # Zustand global state
│   └── package.json         # Frontend dependencies
│
└── README.md                # Project documentation
```

---

## 📄 License

MIT License. Free for personal and commercial use.