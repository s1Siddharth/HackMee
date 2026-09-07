import React from 'react'
import { motion } from 'framer-motion'
import {
  FileSearch,
  Sparkles,
  Cpu,
  LayoutDashboard,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { StatusResponse } from '../../api/types'
import { Button } from '../common/Button'

interface StepConfig {
  id: string
  title: string
  description: string
  icon: React.ElementType
}

const STEPS: StepConfig[] = [
  {
    id: 'detecting',
    title: 'Detecting columns',
    description: 'Scanning schema, data types, null profiles, and encoding constraints',
    icon: FileSearch,
  },
  {
    id: 'cleaning',
    title: 'Cleaning data',
    description: 'Imputing missing values with KNN & deduplicating records',
    icon: Sparkles,
  },
  {
    id: 'analyzing',
    title: 'Running analysis',
    description: 'Generating correlation matrix, K-Means clustering, and anomaly scores',
    icon: Cpu,
  },
  {
    id: 'generating',
    title: 'Generating dashboard',
    description: 'Synthesizing charts, automated narrative insights, and diff views',
    icon: LayoutDashboard,
  },
]

interface ProcessingStepperProps {
  status: StatusResponse | null
  datasetId?: string
  datasetName?: string
  onCancel?: () => void
  onComplete?: () => void
}

export const ProcessingStepper: React.FC<ProcessingStepperProps> = ({
  status,
  datasetId,
  datasetName = 'Spreadsheet Analysis',
  onCancel,
  onComplete,
}) => {
  const currentProgress = status ? status.progress : 15
  const currentStage = status ? status.stage : 'detecting'

  const getStepStatus = (index: number) => {
    const stageIndexMap: Record<string, number> = {
      detecting: 0,
      cleaning: 1,
      analyzing: 2,
      generating: 3,
      done: 4,
      failed: -1,
    }

    const activeIndex = stageIndexMap[currentStage] ?? 0
    if (currentStage === 'done' || index < activeIndex) return 'completed'
    if (index === activeIndex) return 'in_progress'
    return 'pending'
  }

  return (
    <div className="max-w-2xl mx-auto w-full bg-[var(--bg-surface-glass)] backdrop-blur-2xl rounded-2xl p-6 sm:p-10 border border-[var(--border-default)] shadow-2xl relative overflow-hidden transition-colors">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-medium mb-3">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Automated Pipeline Active</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Processing {datasetName}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
          {status?.message || 'Analyzing dataset dimensions and computing metrics...'}
        </p>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] mb-2">
          <span>Overall Progress</span>
          <span className="text-indigo-500 font-semibold">{Math.min(100, Math.round(currentProgress))}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--bg-card-subtle)] overflow-hidden border border-[var(--border-subtle)] relative">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 rounded-full shadow-sm shadow-indigo-500/50"
            initial={{ width: '5%' }}
            animate={{ width: `${Math.min(100, Math.max(5, currentProgress))}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="space-y-4">
        {STEPS.map((step, idx) => {
          const stepStatus = getStepStatus(idx)
          const StepIcon = step.icon

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all duration-200 ${
                stepStatus === 'in_progress'
                  ? 'border-indigo-500/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
                  : stepStatus === 'completed'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] opacity-60'
              }`}
            >
              {/* Step indicator circle */}
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                  stepStatus === 'in_progress'
                    ? 'border-indigo-500 bg-indigo-600/30 text-indigo-500'
                    : stepStatus === 'completed'
                    ? 'border-emerald-500 bg-emerald-600/20 text-emerald-500'
                    : 'border-[var(--border-default)] bg-[var(--bg-card-hover)] text-[var(--text-muted)]'
                }`}
              >
                {stepStatus === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : stepStatus === 'in_progress' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>

              {/* Step text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-sm font-medium ${
                      stepStatus === 'in_progress'
                        ? 'text-[var(--text-primary)] font-semibold'
                        : stepStatus === 'completed'
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {stepStatus === 'completed' && (
                    <span className="text-[11px] font-mono text-emerald-500">Done</span>
                  )}
                  {stepStatus === 'in_progress' && (
                    <span className="text-[11px] font-mono text-indigo-500 animate-pulse">Running...</span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Failure State */}
      {currentStage === 'failed' && (
        <div className="mt-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold">Processing Error</div>
            <div>{status?.error || 'The backend failed to clean or analyze this dataset.'}</div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel Pipeline
          </Button>
        )}
        {currentStage === 'done' && onComplete && (
          <Button
            variant="primary"
            size="md"
            className="ml-auto"
            onClick={onComplete}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Open Dashboard
          </Button>
        )}
      </div>
    </div>
  )
}
