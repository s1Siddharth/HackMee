import React from 'react'
import {
  Hash,
  Type,
  Calendar,
  Check
} from 'lucide-react'
import { ColumnInfo, ColumnType } from '../../api/types'
import { Badge } from '../common/Badge'

interface ColumnCardProps {
  columns: ColumnInfo[]
  selectedColumn: string | null
  onSelectColumn: (columnName: string) => void
}

export const ColumnCard: React.FC<ColumnCardProps> = ({
  columns,
  selectedColumn,
  onSelectColumn,
}) => {
  const getTypeIcon = (type: ColumnType) => {
    switch (type) {
      case 'numeric':
        return <Hash className="w-3.5 h-3.5 text-indigo-500" />
      case 'categorical':
        return <Type className="w-3.5 h-3.5 text-cyan-500" />
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-amber-500" />
      default:
        return <Hash className="w-3.5 h-3.5 text-[var(--text-muted)]" />
    }
  }

  const getTypeBadgeVariant = (type: ColumnType) => {
    switch (type) {
      case 'numeric':
        return 'indigo'
      case 'categorical':
        return 'cyan'
      case 'date':
        return 'amber'
      default:
        return 'default'
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Detected Column Schema & Types
          </span>
          <Badge variant="outline" size="sm">{columns.length} Total</Badge>
        </div>
        <div className="text-[11px] text-[var(--text-muted)]">
          Click any column to filter related charts & views
        </div>
      </div>

      {/* Chips Carousel / Scrollable Strip */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {columns.map((col) => {
          const isSelected = selectedColumn === col.name
          return (
            <button
              key={col.name}
              type="button"
              onClick={() => onSelectColumn(col.name)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs whitespace-nowrap transition-all duration-150 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-white shadow-sm shadow-indigo-500/20 font-semibold'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-mono">
                {getTypeIcon(col.type)}
                <span className="font-medium text-[var(--text-primary)]">{col.name}</span>
              </div>

              <Badge variant={getTypeBadgeVariant(col.type)} size="sm" className="capitalize">
                {col.type}
              </Badge>

              {col.stats?.uniqueValues !== undefined && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  {col.stats.uniqueValues} uniq
                </span>
              )}

              {col.stats?.mean !== undefined && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  avg: {col.stats.mean.toFixed(0)}
                </span>
              )}

              {isSelected && <Check className="w-3 h-3 text-indigo-500 ml-1" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
