import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shell } from '../components/layout/Shell'
import { UploadZone } from '../components/upload/UploadZone'
import { CsvPromptBar } from '../components/upload/CsvPromptBar'
import { UploadHistory } from '../components/upload/UploadHistory'
import { useAnalysisStore } from '../store/useAnalysisStore'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../components/common/Button'

export const UploadPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    uploadFile,
    uploadHistory,
    loadHistory,
    selectDataset,
    isLoading
  } = useAnalysisStore()

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleFileSelect = async (file: File) => {
    try {
      const datasetId = await uploadFile(file)
      navigate(`/processing/${datasetId}`)
    } catch (err) {
      console.error('Upload failed', err)
    }
  }

  const handleSelectHistoryDataset = async (datasetId: string) => {
    await selectDataset(datasetId)
    navigate(`/dashboard/${datasetId}`)
  }

  return (
    <Shell>
      <div className="space-y-8 max-w-4xl mx-auto py-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Data Ingestion Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Ingest & Analyze Dataset
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Provide uncleaned tabular spreadsheets. The file is uploaded to your FastAPI backend for automated cleaning and analysis.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Back to Home
          </Button>
        </div>

        {/* AI CSV Prompt Bar & Ingestion Input */}
        <div className="space-y-6">
          <CsvPromptBar
            isLoading={isLoading}
            onAnalyze={async (file) => {
              if (file) {
                await handleFileSelect(file)
              }
            }}
            onFileSelect={(file) => {
              handleFileSelect(file)
            }}
          />

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]" />
            </div>
            <div className="relative px-4 bg-[var(--bg-page)] text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold transition-colors">
              Or Traditional Bulk Drop
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <UploadZone
            onFileSelect={handleFileSelect}
            isUploading={isLoading}
          />
        </div>

        {/* Upload History Strip */}
        <div className="pt-6 border-t border-[var(--border-subtle)]">
          <UploadHistory
            history={uploadHistory}
            onSelectDataset={handleSelectHistoryDataset}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Shell>
  )
}
