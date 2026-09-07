import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Database,
  ArrowLeft,
  RefreshCw,
  SlidersHorizontal,
  Table as TableIcon,
  BarChart2,
  Calendar,
  AlertCircle,
  UploadCloud,
  MessageSquare,
} from 'lucide-react'
import { Shell } from '../components/layout/Shell'
import { SummaryPanel } from '../components/dashboard/SummaryPanel'
import { ColumnCard } from '../components/dashboard/ColumnCard'
import { ChartCard } from '../components/dashboard/ChartCard'
import { CorrelationHeatmap } from '../components/dashboard/CorrelationHeatmap'
import { OutliersAndClusters } from '../components/dashboard/OutliersAndClusters'
import { AIChatPanel } from '../components/dashboard/AIChatPanel'
import { DataTable } from '../components/table/DataTable'
import { ExportMenu } from '../components/export/ExportMenu'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { useAnalysisStore } from '../store/useAnalysisStore'

export const DashboardPage: React.FC = () => {
  const { datasetId } = useParams<{ datasetId: string }>()
  const navigate = useNavigate()
  const {
    analysis,
    isLoading,
    error,
    loadAnalysis,
    selectedColumnFilter,
    setSelectedColumnFilter,
    viewMode,
    setViewMode,
  } = useAnalysisStore()

  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (datasetId) {
      loadAnalysis(datasetId)
    }
  }, [datasetId, loadAnalysis])

  // Filter charts if user clicks on a column
  const filteredCharts = React.useMemo(() => {
    if (!analysis) return []
    if (!selectedColumnFilter) return analysis.charts

    const filterLower = selectedColumnFilter.toLowerCase()
    const matching = analysis.charts.filter((c) => {
      const titleLower = c.title.toLowerCase()
      const captionLower = c.caption.toLowerCase()
      const xKeyMatch = c.xAxisKey?.toLowerCase() === filterLower
      const yKeyMatch = c.yAxisKey?.toLowerCase() === filterLower
      return (
        xKeyMatch ||
        yKeyMatch ||
        titleLower.includes(filterLower) ||
        captionLower.includes(filterLower)
      )
    })

    return matching.length > 0 ? matching : analysis.charts
  }, [analysis, selectedColumnFilter])

  // No dataset ID provided
  if (!datasetId) {
    return (
      <Shell>
        <div className="py-24 max-w-md mx-auto text-center">
          <EmptyState
            icon={UploadCloud}
            title="No Dataset Selected"
            description="Upload a new CSV or XLSX spreadsheet to generate automated dashboard insights."
            actionLabel="Upload Dataset"
            onAction={() => navigate('/upload')}
          />
        </div>
      </Shell>
    )
  }

  // Loading State
  if (isLoading && !analysis) {
    return (
      <Shell>
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center animate-pulse mb-4">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Synthesizing Dashboard</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
            Retrieving profiled columns, correlation vectors, and automated visualizations from FastAPI backend...
          </p>
        </div>
      </Shell>
    )
  }

  // Error State
  if (error || !analysis) {
    return (
      <Shell>
        <div className="py-20 max-w-md mx-auto text-center">
          <EmptyState
            icon={AlertCircle}
            title="Analysis Unavailable"
            description={error || 'Could not load analysis results from the backend.'}
            actionLabel="Try Again"
            onAction={() => loadAnalysis(datasetId)}
          />
        </div>
      </Shell>
    )
  }

  return (
    <Shell fullWidth>
      {/* AI Chat Panel (slides in from right) */}
      <AIChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        datasetId={datasetId ?? null}
        datasetName={analysis?.name}
      />

      {/* Floating Ask AI button */}
      <button
        onClick={() => setChatOpen(true)}
        className="
          fixed bottom-6 right-6 z-30
          flex items-center gap-2 px-4 py-3 rounded-2xl
          bg-gradient-to-br from-violet-600 to-indigo-500
          text-white text-sm font-semibold shadow-lg shadow-indigo-500/30
          hover:from-violet-500 hover:to-indigo-400
          hover:scale-105 active:scale-95 transition-all
        "
      >
        <MessageSquare className="w-4 h-4" />
        Ask AI
      </button>

      <div id="dashboard-export-target" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Top Control Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <Link to="/upload">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Upload
              </Button>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                  {analysis.name}
                </h1>
                <Badge variant="emerald" size="sm">Pipeline Complete</Badge>
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                <span className="font-mono">ID: {analysis.dataset_id}</span>
                <span>•</span>
                <span>Generated automatically from backend</span>
              </div>
            </div>
          </div>

          {/* Export & Actions */}
          <div className="flex items-center gap-2">
            <ExportMenu
              datasetId={analysis.dataset_id}
              datasetName={analysis.name}
              dashboardElementId="dashboard-export-target"
            />
          </div>
        </div>

        {/* 1. Summary Panel */}
        <ErrorBoundary>
          <SummaryPanel
            summary={analysis.summary}
            stats={analysis.stats}
            datasetName={analysis.name}
          />
        </ErrorBoundary>

        {/* 2. Column Overview Strip */}
        <ErrorBoundary>
          <ColumnCard
            columns={analysis.columns}
            selectedColumn={selectedColumnFilter}
            onSelectColumn={setSelectedColumnFilter}
          />
        </ErrorBoundary>

        {/* Column Filter Pill if active */}
        {selectedColumnFilter && (
          <div className="flex items-center justify-between p-2.5 px-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-600 dark:text-indigo-300">
            <span>
              Filtering visualizations referencing column:{' '}
              <strong className="text-[var(--text-primary)] font-mono">{selectedColumnFilter}</strong>
            </span>
            <button
              onClick={() => setSelectedColumnFilter(null)}
              className="font-medium underline hover:text-[var(--text-primary)] text-xs ml-2"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* 3. Auto-Generated Chart Grid */}
        <ErrorBoundary>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-500" />
                  <span>Auto-Generated Visualizations</span>
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Dynamically synthesized charts matched to column types and multi-variable correlations
                </p>
              </div>
              <Badge variant="outline" size="sm">{filteredCharts.length} Visuals</Badge>
            </div>

            {filteredCharts.length === 0 ? (
              <EmptyState
                icon={BarChart2}
                title="No Visualizations for this filter"
                description="No charts match the active column selection. Clear the filter to see all charts."
                actionLabel="Clear Filter"
                onAction={() => setSelectedColumnFilter(null)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCharts.map((chart) => (
                  <ChartCard
                    key={chart.id || chart.title}
                    chart={chart}
                    isHighlighted={Boolean(
                      selectedColumnFilter &&
                        (chart.xAxisKey === selectedColumnFilter ||
                          chart.yAxisKey === selectedColumnFilter)
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </ErrorBoundary>

        {/* 4. Correlation Heatmap */}
        <ErrorBoundary>
          <CorrelationHeatmap
            columns={analysis.correlations?.columns || []}
            matrix={analysis.correlations?.matrix || []}
          />
        </ErrorBoundary>

        {/* 5. Outliers and Clusters */}
        <ErrorBoundary>
          <OutliersAndClusters
            clusters={analysis.clusters}
            outliers={analysis.outliers}
          />
        </ErrorBoundary>

        {/* 6. Cleaned Dataset Table View with Diff Mode */}
        <ErrorBoundary>
          <DataTable
            rawData={analysis.rawDataSample}
            cleanedData={analysis.cleanedDataSample}
            diffs={analysis.diffs}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
          />
        </ErrorBoundary>
      </div>
    </Shell>
  )
}
