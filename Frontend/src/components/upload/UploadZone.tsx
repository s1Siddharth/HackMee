import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  UploadCloud,
  AlertCircle
} from 'lucide-react'
import { Badge } from '../common/Badge'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  isUploading?: boolean
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  isUploading = false,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null)
    const validExtensions = ['.csv', '.xlsx', '.xls']
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    )

    if (!hasValidExtension) {
      setErrorMessage('Please provide a valid spreadsheet file (.csv or .xlsx)')
      return false
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 50MB maximum limit.')
      return false
    }

    setSelectedFile(file)
    return true
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (validateAndSetFile(file)) {
        onFileSelect(file)
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (validateAndSetFile(file)) {
        onFileSelect(file)
      }
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 md:p-14 transition-all duration-200 text-center bg-[var(--bg-surface-glass)] backdrop-blur-xl overflow-hidden group shadow-sm ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-[var(--border-default)] hover:border-indigo-500/50 hover:bg-[var(--bg-card-hover)]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Hover backdrop gradient */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-500/25 transition-all" />

        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 group-hover:border-indigo-500/60 transition-transform shadow-lg shadow-indigo-500/10">
            <UploadCloud className="w-8 h-8 stroke-[1.75]" />
          </div>

          <h3 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] tracking-tight mb-2">
            Upload raw spreadsheet dataset
          </h3>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6 leading-relaxed">
            Drag and drop your <span className="font-semibold text-[var(--text-primary)]">.CSV</span> or{' '}
            <span className="font-semibold text-[var(--text-primary)]">.XLSX</span> file here, or click to browse.
            The automated pipeline will upload directly to your FastAPI backend for schema detection, cleaning, and model synthesis.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <Badge variant="outline" size="sm">Auto Column Profiling</Badge>
            <Badge variant="outline" size="sm">Backend KNN Imputation</Badge>
            <Badge variant="outline" size="sm">Deduplication</Badge>
            <Badge variant="outline" size="sm">Instant Visualizations</Badge>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}
    </div>
  )
}
