import React from 'react'
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Rows,
  Columns
} from 'lucide-react'
import { HistoryItem } from '../../api/types'
import { Badge } from '../common/Badge'
import { EmptyState } from '../common/EmptyState'

interface UploadHistoryProps {
  history: HistoryItem[]
  onSelectDataset: (datasetId: string) => void
  isLoading?: boolean
}

export const UploadHistory: React.FC<UploadHistoryProps> = ({
  history,
  onSelectDataset,
  isLoading = false,
}) => {
  if (history.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon={FileText}
        title="No Upload History Yet"
        description="Uploaded spreadsheets and automated analysis pipelines will appear here for one-click review."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
          <span>Recent Datasets & Pipelines</span>
          <Badge variant="outline" size="sm">{history.length}</Badge>
        </h4>
        <span className="text-xs text-[var(--text-muted)]">Synced from workspace storage</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {history.map((item) => (
          <div
            key={item.dataset_id}
            onClick={() => onSelectDataset(item.dataset_id)}
            className="group relative cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4.5 hover:border-indigo-500/40 hover:bg-[var(--bg-card-hover)] transition-all duration-150 flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors truncate">
                      {item.name}
                    </h5>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">{item.filename}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    variant={item.status === 'ready' ? 'emerald' : 'amber'}
                    size="sm"
                  >
                    {item.status === 'ready' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    <span className="capitalize">{item.status}</span>
                  </Badge>
                  <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] mt-3 pt-3 border-t border-[var(--border-subtle)]">
                <span className="flex items-center gap-1">
                  <Rows className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>{item.rows.toLocaleString()} rows</span>
                </span>
                <span className="flex items-center gap-1">
                  <Columns className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>{item.columns} cols</span>
                </span>
                {item.missing_handled !== undefined && item.missing_handled > 0 && (
                  <span className="flex items-center gap-1 text-indigo-500 font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span>{item.missing_handled} fixed</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-[var(--text-muted)] ml-auto">
                  <Clock className="w-3 h-3" />
                  <span>{item.created_at}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
