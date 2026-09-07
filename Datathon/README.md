# The Automated Insight Analyst (Frontend)

A modern, production-quality dashboard engine that turns raw spreadsheet data into automated plain-language insights and interactive visualizations.

This frontend connects directly to your **FastAPI** backend (with **Firebase** authentication/storage) configured via `VITE_API_BASE_URL`.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Backend URL
Set your FastAPI backend URL in `.env`:
```env
# Backend API Base URL (FastAPI)
VITE_API_BASE_URL=http://localhost:8000

# Firebase Auth Configuration (Optional - falls back to Evaluator Guest session)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_PROJECT_ID=
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔌 API Endpoints Contract

The frontend connects directly to the following endpoints via [`src/api/service.ts`](src/api/service.ts):

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/upload` | `POST` | Ingests `.csv` or `.xlsx` multipart file and returns `{ dataset_id, status }` |
| `/status/{dataset_id}` | `GET` | Returns `{ stage, progress }` polled during pipeline execution |
| `/analysis/{dataset_id}` | `GET` | Returns summary, column profiles, charts, correlation matrix, clusters, and outliers |
| `/history` | `GET` | Returns list of past datasets for the user |

---

## 🧩 Architecture & Component Structure

```
src/
├── api/
│   ├── client.ts              # Configured Axios client with VITE_API_BASE_URL & auth interceptor
│   ├── types.ts               # Strict TypeScript definitions for API contract models
│   ├── service.ts             # DatasetService (real HTTP calls to FastAPI)
│   └── firebase.ts            # Firebase JS SDK initialization with fallback
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx         # Brand logo, dataset switcher dropdown, theme switch
│   │   └── Shell.tsx          # Responsive layout container with background grid & radial glow
│   ├── auth/
│   │   └── AuthModal.tsx      # Firebase Google + Email login/signup modal with guest bypass
│   ├── upload/
│   │   ├── UploadZone.tsx     # Drag-and-drop CSV/XLSX file zone with validation
│   │   └── UploadHistory.tsx  # Upload history cards (GET /history) with metrics and navigation
│   ├── processing/
│   │   └── ProcessingStepper.tsx # 4-step progress indicator ("Detecting" -> "Cleaning" -> "Analyzing" -> "Generating")
│   ├── dashboard/
│   │   ├── SummaryPanel.tsx   # Plain-language AI summary + row/col/missing/dup stats
│   │   ├── ColumnCard.tsx     # Column chips with type icons (# numeric, A categorical, 📅 date) & filters
│   │   ├── ChartCard.tsx      # Multi-type Recharts (scatter, bar, line, cluster, outlier) + fullscreen modal
│   │   ├── CorrelationHeatmap.tsx # Interactive Pearson correlation matrix with hover inspection
│   │   └── OutliersAndClusters.tsx # Anomaly diagnostics & K-Means centroid segments
│   ├── table/
│   │   └── DataTable.tsx      # Paginated/searchable table with "Before vs After Cleaning" diff highlighting
│   ├── export/
│   │   └── ExportMenu.tsx     # PDF/PNG export and read-only share link generator
│   └── common/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── EmptyState.tsx
│       └── ErrorBoundary.tsx
├── store/
│   ├── useAnalysisStore.ts    # Global dataset lifecycle, polling, active filters, and diff mode
│   ├── useAuthStore.ts        # Firebase user session with guest fallback
│   └── useThemeStore.ts       # Dark/Light mode theme state
└── pages/
    ├── LandingPage.tsx        # Hero pitch, CTA to upload, and backend dataset history
    ├── UploadPage.tsx         # Drag & drop upload zone + past dataset history
    ├── ProcessingPage.tsx     # Animated 4-step processing stepper with live polling
    └── DashboardPage.tsx      # Centerpiece screen integrating all visualization panels
```
