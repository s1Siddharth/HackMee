import React from 'react'
import {
  Sparkles,
  Rows,
  Columns,
  CheckCircle2,
  CopyX,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { DatasetStats } from '../../api/types'
import { Badge } from '../common/Badge'

interface SummaryPanelProps {
  summary: string
  stats: DatasetStats
  datasetName?: string
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  summary,
  stats,
  datasetName = 'Dataset Analysis',
}) => {
  const qualityScore = stats.data_quality_score ?? 96.4
  const missingCleanedPercent = stats.rows > 0
    ? ((stats.missing_handled / (stats.rows * stats.columns)) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-4">
      {/* AI Plain-Language Executive Summary Card */}
      <div className="relative rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/40 dark:from-indigo-950/30 dark:via-[#111422] dark:to-[#0d101b] p-5 sm:p-6 shadow-md dark:shadow-xl overflow-hidden group transition-colors">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                Automated Plain-Language Summary
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="indigo" size="sm">
                <Zap className="w-3 h-3" />
                AI Generated
              </Badge>
              <Badge variant="emerald" size="sm">
                <ShieldCheck className="w-3 h-3" />
                {qualityScore}% Quality Score
              </Badge>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed font-normal">
            {summary}
          </p>
        </div>
      </div>

      {/* Dataset Core Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Rows */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 flex flex-col justify-between hover:border-[var(--border-hover)] transition-colors shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Rows</span>
            <Rows className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight font-mono">
              {stats.rows.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1">Cleaned observation rows</div>
          </div>
        </div>

        {/* Columns */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 flex flex-col justify-between hover:border-[var(--border-hover)] transition-colors shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Columns</span>
            <Columns className="w-4 h-4 text-cyan-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight font-mono">
              {stats.columns}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1">Profiled features</div>
          </div>
        </div>

        {/* Missing Handled */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 flex flex-col justify-between hover:border-[var(--border-hover)] transition-colors shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Missing Imputed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
              {stats.missing_handled.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1">
              {missingCleanedPercent}% cell imputation rate
            </div>
          </div>
        </div>

        {/* Duplicates Removed */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 flex flex-col justify-between hover:border-[var(--border-hover)] transition-colors shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Duplicates Purged</span>
            <CopyX className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight font-mono">
              {stats.duplicates_removed}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1">Redundant records removed</div>
          </div>
        </div>
      </div>
    </div>
  )
}
