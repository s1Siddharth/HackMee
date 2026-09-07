import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Database,
  Moon,
  Sun,
  LayoutDashboard,
  ChevronDown,
  Check
} from 'lucide-react'
import { useAnalysisStore } from '../../store/useAnalysisStore'
import { useThemeStore } from '../../store/useThemeStore'

export const Navbar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentDatasetId, analysis, uploadHistory, selectDataset } = useAnalysisStore()
  const { isDark, toggleTheme } = useThemeStore()

  const [isDatasetMenuOpen, setIsDatasetMenuOpen] = useState(false)

  const activeDatasetName = analysis?.name || (currentDatasetId ? `Dataset ${currentDatasetId}` : 'No Dataset Selected')

  const handleDatasetSwitch = async (datasetId: string) => {
    setIsDatasetMenuOpen(false)
    await selectDataset(datasetId)
    navigate(`/dashboard/${datasetId}`)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface-glass)] backdrop-blur-2xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] group-hover:opacity-80 transition-colors">
              INSIGHTFY
            </span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-[var(--border-subtle)]">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-[var(--text-primary)] bg-[var(--bg-card-hover)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/upload"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                location.pathname === '/upload'
                  ? 'text-[var(--text-primary)] bg-[var(--bg-card-hover)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              Ingest CSV
            </Link>
            <a
              href="/#workflow"
              onClick={(e) => {
                if (location.pathname === '/') {
                  e.preventDefault()
                  document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]"
            >
              Workflow
            </a>
            {currentDatasetId && (
              <Link
                to={`/dashboard/${currentDatasetId}`}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  location.pathname.startsWith('/dashboard')
                    ? 'text-[var(--text-primary)] bg-[var(--bg-card-hover)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Active Dataset Selector Dropdown */}
          {uploadHistory.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDatasetMenuOpen(!isDatasetMenuOpen)}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card-hover)] text-xs font-medium text-[var(--text-primary)] transition-colors max-w-[200px]"
                title="Switch between uploaded datasets"
              >
                <Database className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{activeDatasetName}</span>
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0 ml-auto" />
              </button>

              {isDatasetMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setIsDatasetMenuOpen(false)}
                >
                  <div className="px-3.5 py-1.5 border-b border-[var(--border-subtle)] text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Uploaded Datasets
                  </div>
                  {uploadHistory.map((item) => (
                    <button
                      key={item.dataset_id}
                      onClick={() => handleDatasetSwitch(item.dataset_id)}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {item.rows.toLocaleString()} rows • {item.columns} cols
                        </div>
                      </div>
                      {currentDatasetId === item.dataset_id && (
                        <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dark / Light Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
