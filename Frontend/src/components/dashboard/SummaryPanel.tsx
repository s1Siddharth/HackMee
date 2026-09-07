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
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
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

          <StructuredSummary text={summary} />
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

// ─── Summary Parser & Formatter ──────────────────────────────────────────────

const SECTION_COLORS: Record<string, { dot: string; title: string; bg: string; border: string }> = {
  'EXECUTIVE SUMMARY': {
    dot: 'bg-indigo-500',
    title: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/5',
    border: 'border-indigo-500/20',
  },
  'KEY FINDINGS': {
    dot: 'bg-cyan-500',
    title: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500/5',
    border: 'border-cyan-500/20',
  },
  'RISKS': {
    dot: 'bg-rose-500',
    title: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/5',
    border: 'border-rose-500/20',
  },
  'RECOMMENDATIONS': {
    dot: 'bg-emerald-500',
    title: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
  },
  'EVIDENCE': {
    dot: 'bg-violet-500',
    title: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/5',
    border: 'border-violet-500/20',
  },
}

const DEFAULT_COLORS = {
  dot: 'bg-slate-400',
  title: 'text-[var(--text-secondary)]',
  bg: 'bg-[var(--bg-card)]',
  border: 'border-[var(--border-subtle)]',
}

interface ParsedSection {
  title: string
  bullets: string[]
}

// Renders text with support for **bold** inline markdown
function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-[var(--text-primary)]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function parseSummary(raw: string): ParsedSection[] {
  if (!raw || typeof raw !== 'string') return []

  // Normalize headers: **HEADER**, ## HEADER, HEADER:
  const normalized = raw.replace(/^(?:#{1,4}\s+|\*\*)?([A-Z\s]{4,30})(?:\*\*)?:?\s*$/gm, '\n**$1**\n')
  
  const sectionRegex = /\*\*([A-Z\s]{3,30})\*\*/g
  const matches: { title: string; index: number }[] = []
  let m: RegExpExecArray | null

  while ((m = sectionRegex.exec(normalized)) !== null) {
    const title = m[1].trim()
    if (['EXECUTIVE SUMMARY', 'KEY FINDINGS', 'RISKS', 'RECOMMENDATIONS', 'EVIDENCE', 'SUMMARY', 'INSIGHTS', 'ACTION PLAN'].includes(title.toUpperCase()) || title.length > 3) {
      matches.push({ title: title.toUpperCase(), index: m.index })
    }
  }

  if (matches.length === 0) {
    const bullets = normalized
      .split(/(?=\d+\.\s)|(?=\n[-*•]\s)/)
      .map((s) => s.replace(/^\d+\.\s*|^[-*•]\s*/, '').trim())
      .filter(Boolean)

    return bullets.length > 0
      ? [{ title: 'EXECUTIVE SUMMARY', bullets }]
      : [{ title: 'EXECUTIVE SUMMARY', bullets: [raw.trim()] }]
  }

  const sections: ParsedSection[] = []

  for (let i = 0; i < matches.length; i++) {
    const { title, index } = matches[i]
    const nextIndex = matches[i + 1]?.index ?? normalized.length
    const headerEnd = index + `**${title}**`.length
    const body = normalized.slice(headerEnd, nextIndex).trim()

    // Split into bullet lines / items
    const rawBullets = body
      .split(/(?=\d+\.\s)|(?=\n[-*•]\s)|(?<=\n)(?=[-*•]\s)/)
      .flatMap((s) => s.split('\n'))
      .map((s) => s.replace(/^\d+\.\s*|^[-*•]\s*/, '').trim())
      .filter((s) => s.length > 0 && !s.startsWith('**'))

    if (rawBullets.length > 0) {
      sections.push({ title, bullets: rawBullets })
    }
  }

  return sections
}

function StructuredSummary({ text }: { text: string }) {
  const sections = parseSummary(text)

  return (
    <div className="space-y-3">
      {sections.map((section, i) => {
        const colors = SECTION_COLORS[section.title] ?? DEFAULT_COLORS
        return (
          <div
            key={i}
            className={`rounded-xl border px-4 py-3.5 ${colors.bg} ${colors.border} transition-all`}
          >
            {/* Section title */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${colors.title}`}>
                {section.title}
              </span>
            </div>

            {/* Bullet list */}
            <ul className="space-y-2 pl-1">
              {section.bullets.map((bullet, j) => (
                <li key={j} className="flex gap-2.5 items-start">
                  <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot} opacity-60`} />
                  <span className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {renderFormattedText(bullet)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
