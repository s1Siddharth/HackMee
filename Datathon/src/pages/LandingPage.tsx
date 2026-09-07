import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react'
import { Shell } from '../components/layout/Shell'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { CsvPromptBar } from '../components/upload/CsvPromptBar'
import { PlatformCapabilities } from '../components/landing/PlatformCapabilities'
import { WorkflowSection } from '../components/workflow/WorkflowSection'
import { useAnalysisStore } from '../store/useAnalysisStore'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { uploadHistory, loadHistory, selectDataset, uploadFile, isLoading } = useAnalysisStore()

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleOpenDataset = async (datasetId: string) => {
    await selectDataset(datasetId)
    navigate(`/dashboard/${datasetId}`)
  }

  return (
    <Shell>
      <div className="relative py-12 md:py-20 flex flex-col items-center text-center">
        {/* Top Product Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-medium mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Automated Dashboard Engine</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--text-primary)] max-w-4xl mx-auto leading-[1.08] font-['Space_Grotesk',sans-serif]"
        >
          Turn raw spreadsheets into{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 dark:from-cyan-300 dark:via-teal-200 dark:to-purple-300 bg-clip-text text-transparent">
            instant automated insights.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mt-6 leading-relaxed font-normal"
        >
          Upload any uncleaned CSV or XLSX. INSIGHTFY profiles schemas,
          imputes missing data, detects statistical anomalies, and generates interactive dashboards in seconds.
        </motion.p>

        {/* Hero CSV Prompt Bar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="w-full mt-8"
        >
          <CsvPromptBar
            isLoading={isLoading}
            onAnalyze={async (file, promptText) => {
              if (file) {
                try {
                  const datasetId = await uploadFile(file)
                  navigate(`/processing/${datasetId}`)
                } catch (err) {
                  console.error('Upload failed:', err)
                }
              } else {
                navigate('/upload')
              }
            }}
          />
        </motion.div>

        {/* Uploaded Datasets from Backend History (if any exist) */}
        {uploadHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-14 w-full max-w-4xl"
          >
            <div className="text-left mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                <span>Your Datasets</span>
              </span>
              <span className="text-xs text-[var(--text-muted)]">From backend storage</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
              {uploadHistory.map((item) => (
                <div
                  key={item.dataset_id}
                  onClick={() => handleOpenDataset(item.dataset_id)}
                  className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-indigo-500/40 hover:bg-[var(--bg-card-hover)] cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors truncate">
                        {item.name}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate">
                      {item.filename}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                    <span>{item.rows.toLocaleString()} rows</span>
                    <Badge variant="emerald" size="sm">
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Platform Capabilities (What this platform provides) */}
        <PlatformCapabilities />

        {/* End-to-End Workflow Section */}
        <WorkflowSection />
      </div>
    </Shell>
  )
}
