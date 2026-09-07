import React, { useState, useMemo } from 'react'
import {
  Table as TableIcon,
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { CellDiff } from '../../api/types'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'

interface DataTableProps {
  rawData?: Record<string, any>[]
  cleanedData?: Record<string, any>[]
  diffs?: CellDiff[]
  viewMode?: 'after' | 'before'
  onToggleViewMode?: (mode: 'after' | 'before') => void
}

export const DataTable: React.FC<DataTableProps> = ({
  rawData = [],
  cleanedData = [],
  diffs = [],
  viewMode: controlledViewMode,
  onToggleViewMode,
}) => {
  const [internalViewMode, setInternalViewMode] = useState<'after' | 'before'>('after')
  const activeViewMode = controlledViewMode ?? internalViewMode

  const setViewMode = (mode: 'after' | 'before') => {
    if (onToggleViewMode) {
      onToggleViewMode(mode)
    } else {
      setInternalViewMode(mode)
    }
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const rowsPerPage = 10

  // Choose data source based on view mode
  const currentDataset = activeViewMode === 'before' && rawData.length > 0 ? rawData : cleanedData

  // Identify columns (excluding metadata keys starting with _)
  const columns = useMemo(() => {
    if (!currentDataset || currentDataset.length === 0) return []
    const firstRow = currentDataset[0]
    return Object.keys(firstRow).filter((key) => !key.startsWith('_'))
  }, [currentDataset])

  // Diffs lookup map: key = `${rowIndex}_${column}`
  const diffMap = useMemo(() => {
    const map = new Map<string, CellDiff>()
    diffs.forEach((diff) => {
      map.set(`${diff.rowIndex}_${diff.column}`, diff)
    })
    return map
  }, [diffs])

  // Filter & sort rows
  const filteredAndSortedRows = useMemo(() => {
    if (!currentDataset) return []

    let result = currentDataset.filter((row) => {
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      return Object.entries(row).some(([k, val]) => {
        if (k.startsWith('_')) return false
        return String(val ?? '').toLowerCase().includes(term)
      })
    })

    if (sortField) {
      result = [...result].sort((a, b) => {
        const valA = a[sortField]
        const valB = b[sortField]
        if (valA === valB) return 0
        if (valA === null || valA === undefined) return 1
        if (valB === null || valB === undefined) return -1
        if (valA < valB) return sortAsc ? -1 : 1
        return sortAsc ? 1 : -1
      })
    }

    return result
  }, [currentDataset, searchTerm, sortField, sortAsc])

  // Pagination slice
  const totalPages = Math.ceil(filteredAndSortedRows.length / rowsPerPage) || 1
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredAndSortedRows.slice(start, start + rowsPerPage)
  }, [filteredAndSortedRows, currentPage])

  const handleSort = (col: string) => {
    if (sortField === col) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(col)
      setSortAsc(true)
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredAndSortedRows.length === 0) return
    const headers = columns.join(',')
    const csvRows = filteredAndSortedRows.map((row) =>
      columns.map((c) => JSON.stringify(row[c] ?? '')).join(',')
    )
    const blob = new Blob([[headers, ...csvRows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cleaned_dataset_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-6 space-y-4 shadow-sm transition-colors">
      {/* Table Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <TableIcon className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] tracking-tight">
              Dataset Inspection & Cleaning Diff
            </h3>
            <Badge variant="outline" size="sm">
              {filteredAndSortedRows.length} Rows
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Compare post-cleaned records against raw ingest anomalies, imputed cells, and normalized formats
          </p>
        </div>

        {/* View Mode Switcher + Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Diff Toggle Button Group */}
          <div className="inline-flex rounded-xl border border-[var(--border-subtle)] p-1 bg-[var(--bg-card-subtle)]">
            <button
              onClick={() => setViewMode('after')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeViewMode === 'after'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Cleaned View
            </button>
            <button
              onClick={() => setViewMode('before')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeViewMode === 'before'
                  ? 'bg-amber-600/90 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Diff / Changes</span>
              {diffs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400/20 text-amber-300 font-mono">
                  {diffs.length}
                </span>
              )}
            </button>
          </div>

          {/* Export CSV button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Diff Legend Strip if in diff mode */}
      {activeViewMode === 'before' && (
        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-medium">Diff Mode Enabled:</span>
            <span className="text-[var(--text-secondary)]">Showing transformed cells and imputed missing data points</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-300">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/50 border border-amber-400 inline-block" />
              <span>Imputed Values</span>
            </span>
            <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-300">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/50 border border-cyan-400 inline-block" />
              <span>Reformatted</span>
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-300">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/50 border border-rose-400 inline-block" />
              <span>Deduplicated Row</span>
            </span>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          placeholder="Filter records across all columns..."
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--input-bg)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card-hover)]">
              <th className="p-3 text-[11px] font-mono font-medium text-[var(--text-muted)] uppercase tracking-wider w-12 text-center">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="p-3 text-[11px] font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col}</span>
                    {sortField === col ? (
                      sortAsc ? (
                        <ArrowUp className="w-3 h-3 text-indigo-500" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-indigo-500" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)]" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-[var(--text-muted)] font-sans">
                  No matching records found
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, rIdx) => {
                const globalIdx = (currentPage - 1) * rowsPerPage + rIdx
                return (
                  <tr key={row._rowId || rIdx} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="p-3 text-center text-[11px] text-[var(--text-muted)]">
                      {globalIdx + 1}
                    </td>
                    {columns.map((col) => {
                      const cellValue = row[col]
                      const diff = diffMap.get(`${rIdx}_${col}`)

                      if (activeViewMode === 'before' && diff) {
                        return (
                          <td key={col} className="p-3">
                            <div className="inline-flex items-center gap-1.5 p-1 px-2 rounded border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200">
                              <span className="line-through text-[var(--text-muted)]">
                                {String(diff.originalValue)}
                              </span>
                              <span>→</span>
                              <span className="font-semibold text-[var(--text-primary)]">
                                {String(diff.cleanedValue)}
                              </span>
                            </div>
                          </td>
                        )
                      }

                      return (
                        <td key={col} className="p-3 text-[var(--text-primary)]">
                          {cellValue === null || cellValue === undefined ? (
                            <span className="text-[var(--text-muted)] italic">null</span>
                          ) : typeof cellValue === 'number' ? (
                            cellValue.toLocaleString()
                          ) : (
                            String(cellValue)
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-2">
        <div>
          Showing page <span className="text-[var(--text-primary)] font-medium">{currentPage}</span> of{' '}
          <span className="text-[var(--text-primary)] font-medium">{totalPages}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            icon={<ChevronLeft className="w-3.5 h-3.5" />}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            icon={<ChevronRight className="w-3.5 h-3.5" />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
