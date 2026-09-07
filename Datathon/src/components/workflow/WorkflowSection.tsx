import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  UploadCloud,
  Wand2,
  Cpu,
  LayoutDashboard,
  FileDown,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Zap
} from 'lucide-react'

interface WorkflowStep {
  id: number
  title: string
  shortTitle: string
  icon: React.ComponentType<{ className?: string }>
  badge: string
  duration: string
  summary: string
  details: string[]
  inputs: string
  outputs: string
  algorithms: string[]
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    title: '1. Raw Ingestion & Schema Profiling',
    shortTitle: 'Raw Ingestion',
    icon: UploadCloud,
    badge: 'Stage 1',
    duration: '< 1.5s',
    summary: 'Upload messy CSV or Excel spreadsheets with optional plain-language guidance prompts.',
    details: [
      'Automatic delimiter sniffing (comma, semicolon, tab) and UTF-8 encoding normalization',
      'Column semantic inference: detects numerical, categorical, temporal dates, and unique IDs',
      'Initial quality scan: computes row count, memory footprint, and column null percentages'
    ],
    inputs: 'Uncleaned .csv, .xlsx, or .xls file (up to 50MB) + user instructions',
    outputs: 'Raw schema profile, inferred column types, data quality score',
    algorithms: ['MIME Sniffing', 'Type Heuristics', 'Missing Ratio Calculator']
  },
  {
    id: 2,
    title: '2. Autonomous Cleaning & Imputation',
    shortTitle: 'Cleaning & Imputation',
    icon: Wand2,
    badge: 'Stage 2',
    duration: '< 2.0s',
    summary: 'Missing nulls, inconsistent date formats, and duplicates are automatically cleaned.',
    details: [
      'Missing value imputation using K-Nearest Neighbors (KNN) or robust median replacement',
      'Automated deduplication and whitespace/character trimming across text columns',
      'Outlier boundary calculation using Interquartile Range (IQR) and standard deviation fences'
    ],
    inputs: 'Raw dataset + cleaning preset (Balanced, Fast, Deep, or Conservative)',
    outputs: 'Cleaned dataset table with cell-level audit log of every modified value',
    algorithms: ['KNN Neighbor Imputer', 'IQR Anomaly Fencing', 'Exact Deduplication']
  },
  {
    id: 3,
    title: '3. Correlation & Statistical Engine',
    shortTitle: 'Statistical Analytics',
    icon: Cpu,
    badge: 'Stage 3',
    duration: '< 1.0s',
    summary: 'Calculates multi-dimensional statistical relations and distribution dynamics.',
    details: [
      'Pairwise Pearson correlation coefficients (r from -1.0 to +1.0) across numerical columns',
      'Five-number statistical summaries: minimum, Q1, median, mean, Q3, maximum, and standard deviation',
      'Identification of strong positive/negative relationships and key driving indicators'
    ],
    inputs: 'Imputed numeric arrays and structured categorical vectors',
    outputs: 'Full correlation matrix, column statistics table, and correlation highlights',
    algorithms: ['Pearson Linear Matrix', 'Distribution Skewness', 'Variance Analysis']
  },
  {
    id: 4,
    title: '4. Visual Synthesis & Executive Insights',
    shortTitle: 'Visual Synthesis',
    icon: LayoutDashboard,
    badge: 'Stage 4',
    duration: '< 2.5s',
    summary: 'Synthesizes targeted interactive charts and automated plain-language executive takeaways.',
    details: [
      'Automatic chart matching: distributions to histograms, time series to area charts, categories to bars',
      'Interactive correlation heatmap with color-coded correlation intensity values',
      'Automated plain-language narrative bullet points highlighting outliers, trends, and growth metrics'
    ],
    inputs: 'Profiled metadata, correlation pairs, and aggregated data points',
    outputs: 'Recharts visual dashboard, Pearson heatmap, and key business takeaway bullets',
    algorithms: ['Semantic Chart Matcher', 'Binning Aggregators', 'Automated Insight NLG']
  },
  {
    id: 5,
    title: '5. Audit Diff, Filtering & Multi-Format Export',
    shortTitle: 'Audit & Export',
    icon: FileDown,
    badge: 'Stage 5',
    duration: 'Instant',
    summary: 'Audit cell modifications with before/after diffs, slice by column, and export executive reports.',
    details: [
      'Full data table inspector with green/amber diff tags highlighting imputed and cleaned cells',
      'One-click drill-down: filter entire dashboard by clicking any column card',
      'Instant export to presentation-ready PDF reports, high-resolution PNG slides, or shareable links'
    ],
    inputs: 'Synthesized dashboard DOM state and audit log',
    outputs: 'Executive PDF document, high-resolution PNG slide, clean CSV download',
    algorithms: ['Cell Diff Engine', 'Vector PDF Generator', 'HTML5 Canvas Rendering']
  }
]

export const WorkflowSection: React.FC = () => {
  const [activeStepId, setActiveStepId] = useState<number>(1)
  const activeStep = WORKFLOW_STEPS.find((s) => s.id === activeStepId) || WORKFLOW_STEPS[0]

  // Automatically advance to the next stage every 5 seconds non-stop
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepId((prev) => (prev % WORKFLOW_STEPS.length) + 1)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section id="workflow" className="w-full max-w-5xl mx-auto mt-24 text-left scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-medium mb-4 shadow-sm">
          <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
          <span>Automated End-to-End Pipeline</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          How INSIGHTFY Works
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3 leading-relaxed">
          From uncleaned raw spreadsheets to production-grade dashboards, automated in 5 transparent stages.
        </p>
      </div>

      {/* Interactive Stage Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] mb-8">
        {WORKFLOW_STEPS.map((step) => {
          const isActive = step.id === activeStepId
          const isCompleted = step.id < activeStepId

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStepId(step.id)}
              className={`group relative flex flex-col items-center sm:items-start p-3 rounded-xl transition-all text-left overflow-hidden ${
                isActive
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-md border border-[var(--border-default)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70 hidden sm:inline">
                  {step.badge}
                </span>
              </div>
              <span className="text-xs font-medium truncate w-full text-center sm:text-left">
                {step.shortTitle}
              </span>

              {/* 5-second dynamic countdown progress bar */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500/20 overflow-hidden">
                  <motion.div
                    key={`progress-bar-${activeStepId}`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{
                      duration: 5,
                      ease: 'linear'
                    }}
                    className="h-full bg-indigo-500"
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Active Stage Deep-Dive Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 flex items-center justify-center shrink-0 shadow-inner">
                <activeStep.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                    {activeStep.badge}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">•</span>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                    <Zap className="w-3 h-3 text-amber-400" />
                    {activeStep.duration}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
                  {activeStep.title}
                </h3>
              </div>
            </div>

            {/* Step Navigation Previous/Next Buttons (Play/Pause removed) */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                disabled={activeStep.id === 1}
                onClick={() => setActiveStepId((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-default)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={activeStep.id === WORKFLOW_STEPS.length}
                onClick={() => setActiveStepId((prev) => Math.min(prev + 1, WORKFLOW_STEPS.length))}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next Stage
              </button>
            </div>
          </div>

          {/* Body Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 relative z-10">
            {/* Left Column: Summary & What Happens */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Process Overview
                </h4>
                <p className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed font-normal">
                  {activeStep.summary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
                  Under The Hood Actions
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                  {activeStep.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Inputs, Outputs & Algorithms */}
            <div className="space-y-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] p-4.5 text-xs">
              <div>
                <span className="font-semibold text-[var(--text-primary)] block mb-1">
                  📥 Input Data
                </span>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {activeStep.inputs}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <span className="font-semibold text-[var(--text-primary)] block mb-1">
                  📤 Generated Output
                </span>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {activeStep.outputs}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <span className="font-semibold text-[var(--text-primary)] block mb-2">
                  ⚙️ Active Engine Logic
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeStep.algorithms.map((algo, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[11px] font-mono"
                    >
                      {algo}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Direct CTA at Bottom of Workflow */}
      <div className="mt-8 text-center">
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <span>Try This Workflow With Your Dataset</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
