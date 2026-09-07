import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Sparkles,
  ArrowUp,
  FileSpreadsheet,
  X,
  Settings2,
  ChevronDown,
  Check,
  Zap,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Sliders
} from 'lucide-react'

export interface CsvPromptBarProps {
  onAnalyze?: (file: File | null, prompt: string, options: PromptOptions) => void
  onFileSelect?: (file: File) => void
  isLoading?: boolean
  className?: string
  defaultPrompt?: string
}

export interface PromptOptions {
  mode: 'dashboard' | 'clean' | 'forecast'
  preset: 'balanced' | 'fast' | 'deep' | 'conservative'
  imputation: 'knn' | 'mean' | 'median' | 'drop'
  detectOutliers: boolean
}

const PRESET_OPTIONS = [
  {
    id: 'balanced',
    name: 'Balanced',
    desc: 'Auto-detect schema, standard KNN imputation, auto-visuals'
  },
  {
    id: 'fast',
    name: 'High Speed',
    desc: 'Fast imputation, core statistical summary & quick dashboard'
  },
  {
    id: 'deep',
    name: 'Deep Statistical',
    desc: 'Full distribution fit, anomaly detection, correlation matrix'
  },
  {
    id: 'conservative',
    name: 'Conservative',
    desc: 'Minimal transformation, preserving raw values without imputation'
  }
] as const

const SAMPLE_DATASETS = [
  {
    title: 'E-commerce quarterly revenue & sales breakdown...',
    prompt: 'Analyze quarterly e-commerce revenue by channel with sales trend predictions and missing value imputation.',
    filename: 'quarterly_sales_data_2024.csv',
    content: `Date,Channel,Units_Sold,Unit_Price,Revenue,Discount_Pct,Customer_Region,Return_Rate
2024-01-15,Organic Search,120,49.99,5998.80,0.05,North America,0.02
2024-01-16,Paid Ads,340,39.99,13596.60,0.15,Europe,0.04
2024-01-17,Direct,85,59.99,5099.15,,North America,0.01
2024-01-18,Social Media,210,29.99,6297.90,0.20,Asia Pacific,0.06
2024-01-19,Email Newsletter,150,49.99,7498.50,0.10,Europe,0.03
2024-01-20,Organic Search,,49.99,7248.55,0.05,North America,0.02
2024-01-21,Affiliates,95,35.00,3325.00,0.08,South America,0.05
2024-01-22,Paid Ads,410,39.99,16395.90,0.18,North America,0.04`
  },
  {
    title: 'Customer churn & retention risk indicators...',
    prompt: 'Profile customer retention factors, segment churn risks, and highlight high-value attrition indicators.',
    filename: 'saas_customer_churn_metrics.csv',
    content: `CustomerID,TenureMonths,MonthlyCharge,TotalSpend,SupportTickets,ContractType,Churned
1001,12,65.50,786.00,2,Month-to-Month,No
1002,2,89.90,179.80,5,Month-to-Month,Yes
1003,36,45.00,1620.00,0,Two-Year,No
1004,8,110.20,881.60,4,Month-to-Month,Yes
1005,24,79.50,1908.00,1,One-Year,No
1006,1,55.00,,3,Month-to-Month,Yes
1007,48,95.00,4560.00,0,Two-Year,No`
  },
  {
    title: 'Healthcare patient vitals & anomaly detection...',
    prompt: 'Detect statistical anomalies in patient biomarkers, impute null lab values, and chart risk distributions.',
    filename: 'patient_vitals_study.csv',
    content: `PatientID,Age,SystolicBP,DiastolicBP,Cholesterol,BMI,Glucose,OutcomeRisk
P-01,45,128,82,210,26.4,95,Low
P-02,62,148,94,265,31.2,142,High
P-03,34,115,75,180,22.1,88,Low
P-04,58,,88,240,29.8,118,Medium
P-05,71,162,102,290,34.5,160,High
P-06,29,118,78,175,23.5,,Low`
  }
]

export const CsvPromptBar: React.FC<CsvPromptBarProps> = ({
  onAnalyze,
  onFileSelect,
  isLoading = false,
  className = '',
  defaultPrompt = ''
}) => {
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activeMode, setActiveMode] = useState<'dashboard' | 'clean' | 'forecast'>('dashboard')
  const [activePreset, setActivePreset] = useState<'balanced' | 'fast' | 'deep' | 'conservative'>('balanced')
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [imputationMethod, setImputationMethod] = useState<'knn' | 'mean' | 'median' | 'drop'>('knn')
  const [detectOutliers, setDetectOutliers] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`
    }
  }, [prompt])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPresetDropdownOpen(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFileChange = (file: File) => {
    setSelectedFile(file)
    if (onFileSelect) {
      onFileSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0])
    }
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
      handleFileChange(file)
    }
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSelectSample = (sample: typeof SAMPLE_DATASETS[number]) => {
    setPrompt(sample.prompt)
    const blob = new Blob([sample.content], { type: 'text/csv' })
    const file = new File([blob], sample.filename, { type: 'text/csv' })
    handleFileChange(file)
  }

  const handleSubmit = () => {
    if (isLoading) return
    const options: PromptOptions = {
      mode: activeMode,
      preset: activePreset,
      imputation: imputationMethod,
      detectOutliers
    }
    if (onAnalyze) {
      onAnalyze(selectedFile, prompt, options)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const currentPresetObj = PRESET_OPTIONS.find((p) => p.id === activePreset)

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.tsv"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Main Glass Prompt Bar Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-[28px] p-4 sm:p-5 transition-all duration-300 backdrop-blur-2xl shadow-2xl border bg-[var(--bg-surface-glass)] ${
          isDragging
            ? 'border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.3)] ring-2 ring-indigo-500/50'
            : 'border-[var(--border-default)] hover:border-[var(--border-hover)] shadow-xl'
        }`}
      >
        {/* Subtle Ambient Top Glow */}
        <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/40 via-purple-500/40 to-transparent pointer-events-none" />

        {/* Drag Overlay State */}
        {isDragging && (
          <div className="absolute inset-0 rounded-[28px] bg-indigo-500/10 backdrop-blur-sm border-2 border-dashed border-indigo-500 flex items-center justify-center z-30 pointer-events-none">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-indigo-500/40 text-indigo-500 text-sm font-medium shadow-xl">
              <FileSpreadsheet className="w-5 h-5 text-indigo-500 animate-bounce" />
              <span>Drop CSV to attach and analyze</span>
            </div>
          </div>
        )}

        {/* Top Attached File Pill */}
        {selectedFile && (
          <div className="mb-3 flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-medium shadow-sm">
              <FileSpreadsheet className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="font-semibold text-[var(--text-primary)] truncate max-w-[220px] sm:max-w-[340px]">
                {selectedFile.name}
              </span>
              <span className="text-[var(--text-muted)] text-[11px]">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-1 p-0.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Text / Prompt Area */}
        <div className="relative min-h-[44px] flex items-start">
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedFile
                ? "What specific questions or cleaning instructions do you have for this dataset?"
                : "What dataset shall we analyze or ingest? (Attach CSV or type instructions)..."
            }
            className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-base sm:text-lg focus:outline-none resize-none overflow-hidden leading-relaxed font-normal tracking-wide pr-2"
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 flex-wrap">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            {/* Plus / File Attach Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] active:scale-95 transition-all border border-transparent hover:border-[var(--border-default)]"
              title="Attach CSV / Spreadsheet"
            >
              <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Segmented Mode Toggle */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] shadow-inner text-xs">
              <button
                type="button"
                onClick={() => setActiveMode('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  activeMode === 'dashboard'
                    ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm border border-[var(--border-default)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('clean')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  activeMode === 'clean'
                    ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm border border-[var(--border-default)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Deep Clean</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('forecast')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  activeMode === 'forecast'
                    ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm border border-[var(--border-default)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Forecast</span>
              </button>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 relative">
            {/* Settings Button */}
            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all border ${
                  isSettingsOpen ? 'bg-[var(--bg-card-hover)] text-[var(--text-primary)] border-[var(--border-default)]' : 'border-transparent'
                }`}
                title="Analysis Parameters & Imputation Rules"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Settings Dropdown Popover */}
              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl backdrop-blur-2xl z-50 text-xs space-y-3"
                  >
                    <div className="font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1.5 flex items-center justify-between">
                      <span>Pipeline Settings</span>
                      <Settings2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </div>

                    <div>
                      <label className="text-[11px] text-[var(--text-secondary)] block mb-1">
                        Imputation Strategy
                      </label>
                      <select
                        value={imputationMethod}
                        onChange={(e) => setImputationMethod(e.target.value as any)}
                        className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-default)] rounded-lg px-2.5 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 text-xs dark:bg-slate-900"
                      >
                        <option value="knn" className="bg-white dark:bg-[#0f131f] text-slate-900 dark:text-slate-100">KNN Neighbor Impute</option>
                        <option value="median" className="bg-white dark:bg-[#0f131f] text-slate-900 dark:text-slate-100">Median Replacement</option>
                        <option value="mean" className="bg-white dark:bg-[#0f131f] text-slate-900 dark:text-slate-100">Mean Value</option>
                        <option value="drop" className="bg-white dark:bg-[#0f131f] text-slate-900 dark:text-slate-100">Drop Incomplete Rows</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[var(--text-primary)]">Detect Outliers</span>
                      <input
                        type="checkbox"
                        checked={detectOutliers}
                        onChange={(e) => setDetectOutliers(e.target.checked)}
                        className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quality Pill Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] text-xs font-medium text-[var(--text-primary)] transition-all shadow-inner"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>{currentPresetObj?.name || 'Balanced'}</span>
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
              </button>

              {/* Preset Dropdown Menu */}
              <AnimatePresence>
                {isPresetDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 bottom-full mb-2 w-56 p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl backdrop-blur-2xl z-50 space-y-1"
                  >
                    {PRESET_OPTIONS.map((item) => {
                      const isSelected = activePreset === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActivePreset(item.id as any)
                            setIsPresetDropdownOpen(false)
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-semibold'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <div>
                            <div>{item.name}</div>
                            <div className="text-[10px] text-[var(--text-muted)] font-normal mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0 ml-1.5" />}
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Prompt Enhancer */}
            <button
              type="button"
              onClick={() => {
                if (!prompt) {
                  setPrompt("Profile dataset, clean missing null values using KNN, and create an automated executive dashboard.")
                } else {
                  setPrompt((prev) => `${prev} with detailed trend breakdown and automated anomaly detection.`)
                }
              }}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/30"
              title="Auto-enhance prompt"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </button>

            {/* Submit Arrow Button */}
            <button
              type="button"
              disabled={isLoading || (!prompt.trim() && !selectedFile)}
              onClick={handleSubmit}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isLoading
                  ? 'bg-gray-400 dark:bg-gray-700 text-gray-200 dark:text-gray-400 cursor-not-allowed'
                  : prompt.trim() || selectedFile
                  ? 'bg-indigo-600 dark:bg-white text-white dark:text-gray-950 hover:scale-105 active:scale-95 shadow-lg'
                  : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)] cursor-not-allowed'
              }`}
              title="Submit and Run Pipeline"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-4.5 h-4.5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="mt-4 flex items-center justify-center sm:justify-start gap-2.5 flex-wrap overflow-x-auto pb-1">
        {SAMPLE_DATASETS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSample(sample)}
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-indigo-500/40 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm shrink-0"
          >
            <Sparkles className="w-3 h-3 text-indigo-500 group-hover:scale-110 transition-transform" />
            <span className="truncate max-w-[220px] sm:max-w-[280px]">
              {sample.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
