import React, { useState } from 'react'
import {
  Grid,
  Info,
  Layers
} from 'lucide-react'
import { Badge } from '../common/Badge'

interface CorrelationHeatmapProps {
  columns: string[]
  matrix: number[][]
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  columns,
  matrix,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    rowCol: string
    colCol: string
    value: number
  } | null>(null)

  // Empty state if no numeric columns or matrix is empty
  if (!columns || columns.length < 2 || !matrix || matrix.length < 2) {
    return (
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 text-center shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mx-auto mb-3">
          <Layers className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-1">
          Correlation Heatmap Not Applicable
        </h4>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
          Correlation matrix requires at least 2 numeric columns. Current dataset contains mostly categorical or single-variable dimensions.
        </p>
      </div>
    )
  }

  // Get color for correlation value from -1.0 (crimson) to 0.0 (slate) to +1.0 (electric indigo)
  const getCellColor = (val: number) => {
    if (val === 1) return 'bg-indigo-600 text-white font-bold'
    if (val >= 0.7) return 'bg-indigo-500/80 text-white font-semibold'
    if (val >= 0.4) return 'bg-indigo-500/40 text-indigo-950 dark:text-indigo-200'
    if (val > 0.1) return 'bg-indigo-500/20 text-indigo-900 dark:text-indigo-300'
    if (val >= -0.1) return 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
    if (val >= -0.4) return 'bg-rose-500/20 text-rose-900 dark:text-rose-300'
    if (val >= -0.7) return 'bg-rose-500/40 text-rose-950 dark:text-rose-200'
    return 'bg-rose-600/80 text-white font-semibold'
  }

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-6 space-y-4 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <Grid className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] tracking-tight">
              Feature Correlation Matrix (Pearson r)
            </h3>
            <Badge variant="indigo" size="sm">Automated</Badge>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Interactive heatmap revealing collinearities and cross-feature dependencies across numeric columns
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-500/80 inline-block" />
            <span>-1.0 (Inverse)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-300 dark:bg-white/10 inline-block" />
            <span>0.0</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
            <span>+1.0 (Direct)</span>
          </span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full align-middle">
          <table className="border-collapse table-auto">
            <thead>
              <tr>
                <th className="p-2 text-left text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider min-w-[120px]">
                  Feature
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="p-2 text-center text-[11px] font-mono text-[var(--text-secondary)] font-medium min-w-[85px] truncate max-w-[110px]"
                    title={col}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {columns.map((rowCol, rowIndex) => (
                <tr key={rowCol} className="border-t border-[var(--border-subtle)]">
                  <td className="p-2 text-[11px] font-mono font-medium text-[var(--text-primary)] truncate max-w-[120px]" title={rowCol}>
                    {rowCol}
                  </td>
                  {columns.map((colCol, colIndex) => {
                    const value = matrix[rowIndex]?.[colIndex] ?? 0
                    return (
                      <td
                        key={colCol}
                        onMouseEnter={() => setHoveredCell({ rowCol, colCol, value })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className="p-1 text-center"
                      >
                        <div
                          className={`w-full py-2.5 px-2 rounded-lg text-xs font-mono transition-transform hover:scale-105 cursor-pointer select-none ${getCellColor(
                            value
                          )}`}
                        >
                          {value.toFixed(2)}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Tooltip Card on Hover */}
      {hoveredCell && (
        <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-950/20 text-xs text-[var(--text-primary)] flex items-center justify-between gap-4 animate-in fade-in duration-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              Pairwise relation between <strong>{hoveredCell.rowCol}</strong> and{' '}
              <strong>{hoveredCell.colCol}</strong>:
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-[var(--text-muted)]">r =</span>
            <span className="text-indigo-600 dark:text-indigo-300 font-bold text-sm">
              {hoveredCell.value.toFixed(2)}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {hoveredCell.value >= 0.7
                ? '(Strong positive)'
                : hoveredCell.value <= -0.7
                ? '(Strong inverse)'
                : hoveredCell.value === 1
                ? '(Identity)'
                : '(Moderate / Low)'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
