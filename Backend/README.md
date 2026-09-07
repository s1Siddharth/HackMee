# AI Data Analyst Dashboard

An **AI-Powered Data Analysis Dashboard** built with **Python, Streamlit, Pandas, Plotly, Scikit-learn, and Groq**. The application allows users to upload datasets, clean and explore data, generate interactive visualizations, detect anomalies, and receive AI-powered analytical insights and business recommendations.

---

## Features

### 1. Dataset Upload

Upload datasets directly through the dashboard.

**Supported formats:**

* CSV
* Excel (`.xlsx`)
* JSON

The application validates the uploaded dataset before processing.

---

### 2. Dataset Profiling

Automatically analyzes the uploaded dataset and displays:

* Total rows
* Total columns
* Missing values
* Duplicate records
* Data quality score
* Column data types
* Numerical statistics
* Column-level data quality information

---

### 3. Data Cleaning & Preprocessing

The dashboard provides automated preprocessing operations:

* Remove duplicate rows
* Standardize column names
* Detect and convert date columns
* Fill missing values
* Remove constant columns
* Compare dataset before and after cleaning
* Generate a cleaning-operation report
* Download the cleaned dataset

---

### 4. Search & Filtering

Users can interactively explore subsets of their data.

Supported operations include:

* Global search across columns
* Categorical filtering
* Numeric filtering
* Greater than / less than conditions
* Equality conditions
* Filtered record counts
* Filtered dataset preview

The filtered dataset can also be used for visualization and analysis.

---

### 5. Interactive Data Visualization

The dashboard uses **Plotly** to generate interactive charts.

Available visualizations include:

* Bar charts
* Line charts
* Pie / Donut charts
* Histograms
* Scatter plots
* Box plots
* Correlation heatmaps

Users can dynamically select columns for visualization.

### Large Dataset Optimization

Large datasets are optimized for interactive visualization using:

* Intelligent sampling
* Category aggregation
* Time-series aggregation
* Limited category visualization
* Optimized Plotly rendering

The original dataset remains available for analytical calculations.

---

### 6. Anomaly Detection

The application detects unusual records using multiple approaches:

#### IQR Method

Identifies statistical outliers using:

* Q1
* Q3
* Interquartile Range
* Lower and upper bounds

#### Isolation Forest

Uses machine learning to identify potentially anomalous records based on numerical patterns.

The dashboard provides:

* Number of records analyzed
* IQR outliers
* ML anomalies
* Combined anomalies
* Anomaly percentage
* Detected anomaly records

> An anomaly is treated as a **potentially unusual observation**, not automatically as an incorrect record.

---

### 7. AI-Powered Insights

The dashboard uses **Groq** to transform calculated analytical evidence into natural-language insights.

The AI can generate:

* Executive summaries
* Key findings
* Trends and patterns
* Data-quality observations
* Potential risks
* Outlier observations
* Business recommendations
* Feature-engineering suggestions
* Data-enrichment recommendations
* Monitoring and governance suggestions

The application follows an evidence-grounded architecture:

```text
Raw Dataset
     ↓
Pandas / Statistical Analysis
     ↓
Verified Analytical Evidence
     ↓
Prompt Builder
     ↓
Groq LLM
     ↓
AI Insights
```

The raw dataset is **not directly sent to the LLM for analysis**. Analytical evidence is calculated first.

---

### 8. Bring Your Own API Key

Users can provide their own Groq API key through the dashboard.

```text
AI Configuration
       ↓
AI Provider → Groq
       ↓
Groq API Key
       ↓
Test Connection
       ↓
Generate AI Insights
```

This allows the application to be used publicly without exposing the developer's personal API key.

API keys should not be committed to GitHub or included directly in source code.

---

## Project Architecture

```text
ai-data-analyst/
│
├── app.py
├── requirements.txt
├── .env
├── .gitignore
├── README.md
│
└── src/
    │
    ├── ingestion/
    │   ├── __init__.py
    │   └── loader.py
    │
    ├── preprocessing/
    │   ├── __init__.py
    │   ├── profiler.py
    │   └── cleaner.py
    │
    ├── analytics/
    │   ├── __init__.py
    │   ├── filters.py
    │   └── anomaly_detector.py
    │
    ├── visualization/
    │   ├── __init__.py
    │   ├── charts.py
    │   └── recommendations.py
    │
    └── ai/
        ├── __init__.py
        ├── insight_analyzer.py
        ├── prompt_builder.py
        └── llm.py
```

---

## Technology Stack

| Technology        | Purpose                            |
| ----------------- | ---------------------------------- |
| **Python**        | Core programming language          |
| **Streamlit**     | Interactive web dashboard          |
| **Pandas**        | Data processing and analysis       |
| **NumPy**         | Numerical operations               |
| **Plotly**        | Interactive visualization          |
| **Scikit-learn**  | Machine-learning anomaly detection |
| **Groq**          | AI-powered insight generation      |
| **OpenPyXL**      | Excel file processing              |
| **python-dotenv** | Environment configuration          |

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ASWINa1636/AI-Data_Analyst-Dashboard
cd ai-data-analyst
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

### 3. Activate the virtual environment

**Windows:**

```bash
.venv\Scripts\activate
```

**Linux / macOS:**

```bash
source .venv/bin/activate
```

### 4. Install dependencies

```bash
python -m pip install -r requirements.txt
```

---

## Groq API Configuration

### Option 1 — User-provided API key

The dashboard allows users to enter their Groq API key through the sidebar.

```text
AI Configuration

AI Provider
Groq

Groq API Key
••••••••••••••

🔌 Test Connection
```

### Option 2 — Local development

For local development, you can use a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
```

**Never commit `.env` to GitHub.**

Add this to `.gitignore`:

```gitignore
.env
.venv/
__pycache__/
*.pyc
```

---

## Running the Application

Start the Streamlit application:

```bash
streamlit run app.py
```

The dashboard will open in your browser.

Typical local address:

```text
http://localhost:8501
```

---

## Application Workflow

```text
                 ┌─────────────────┐
                 │ Upload Dataset  │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Data Validation │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Data Profiling  │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Data Cleaning   │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Search & Filter │
                 └────────┬────────┘
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
      ┌───────────────┐       ┌───────────────┐
      │ Visualization │       │    Anomaly    │
      │    Engine     │       │   Detection   │
      └───────┬───────┘       └───────┬───────┘
              │                       │
              └───────────┬───────────┘
                          ↓
                 ┌─────────────────┐
                 │ Evidence Engine │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │   Groq LLM      │
                 └────────┬────────┘
                          ↓
             ┌────────────────────────┐
             │ AI-Powered Insights    │
             │ • Findings             │
             │ • Risks                │
             │ • Recommendations      │
             └────────────────────────┘
```

---

## Example Use Cases

The dashboard can be used for datasets such as:

* Sales analytics
* Customer analytics
* E-commerce data
* Marketing data
* Financial datasets
* HR datasets
* Product performance
* Social media datasets
* IoT datasets
* Business performance data

---

## Data & API Security

For public deployment:

* Do not hard-code API keys.
* Do not commit `.env` files.
* Do not expose API keys in GitHub.
* Use password-type fields for user-entered API keys.
* Avoid logging API keys.
* Avoid storing user API keys permanently.
* Send only the analytical evidence required for AI generation rather than the complete raw dataset.

---

## Project Objectives

This project demonstrates practical experience in:

* Data Science
* Data preprocessing
* Exploratory Data Analysis
* Data visualization
* Business intelligence
* Machine learning
* Anomaly detection
* Generative AI
* LLM integration
* API integration
* Dashboard development
* Data-driven decision making

---

## Future Enhancements

Planned improvements include:

* [ ] Smart date/time intelligence
* [ ] Automatic semantic column classification
* [ ] Structured AI response using JSON
* [ ] Professional AI insight cards
* [ ] Advanced anomaly visualization
* [ ] AI-powered natural-language data querying
* [ ] "Ask your dataset" chatbot
* [ ] Automated report generation
* [ ] PDF report export
* [ ] Excel analytical report export
* [ ] Multiple AI providers
* [ ] Dashboard KPI recommendations
* [ ] Automatic chart recommendations
* [ ] Advanced time-series analysis
* [ ] Deployment as a public web application

---

## Current Status

**Development Status: Active**

Currently implemented:

```text
✅ Dataset Upload
✅ Dataset Profiling
✅ Data Quality Analysis
✅ Data Cleaning
✅ Cleaning Report
✅ Search & Filtering
✅ Interactive Visualizations
✅ Large Dataset Visualization Optimization
✅ IQR Outlier Detection
✅ Isolation Forest Anomaly Detection
✅ Groq AI Integration
✅ AI-Generated Insights
✅ User API Key Support
```
---