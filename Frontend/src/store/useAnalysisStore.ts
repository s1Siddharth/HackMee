import { create } from 'zustand'
import { datasetService } from '../api/service'
import {
  AnalysisResponse,
  HistoryItem,
  StatusResponse
} from '../api/types'

interface AnalysisState {
  currentDatasetId: string | null
  analysis: AnalysisResponse | null
  status: StatusResponse | null
  uploadHistory: HistoryItem[]
  isLoading: boolean
  error: string | null
  viewMode: 'after' | 'before'
  selectedColumnFilter: string | null

  // Actions
  setViewMode: (mode: 'after' | 'before') => void
  setSelectedColumnFilter: (col: string | null) => void
  loadHistory: () => Promise<void>
  selectDataset: (datasetId: string) => Promise<void>
  loadAnalysis: (datasetId: string) => Promise<AnalysisResponse | null>
  uploadFile: (file: File) => Promise<string>
  pollStatus: (datasetId: string, onDone: () => void) => () => void
  resetState: () => void
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  currentDatasetId: null,
  analysis: null,
  status: null,
  uploadHistory: [],
  isLoading: false,
  error: null,
  viewMode: 'after',
  selectedColumnFilter: null,

  setViewMode: (mode: 'after' | 'before') => {
    set({ viewMode: mode })
  },

  setSelectedColumnFilter: (col: string | null) => {
    set((state) => ({
      selectedColumnFilter: state.selectedColumnFilter === col ? null : col,
    }))
  },

  loadHistory: async () => {
    try {
      const items = await datasetService.getHistory()
      set({ uploadHistory: items })
    } catch (err: any) {
      console.warn('Could not retrieve history from backend:', err)
      set({ uploadHistory: [] })
    }
  },

  selectDataset: async (datasetId: string) => {
    set({ currentDatasetId: datasetId, isLoading: true, error: null })
    try {
      const analysis = await datasetService.getAnalysis(datasetId)
      set({ analysis, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch dataset analysis from API', isLoading: false })
    }
  },

  loadAnalysis: async (datasetId: string) => {
    set({ isLoading: true, error: null, currentDatasetId: datasetId })
    try {
      const analysis = await datasetService.getAnalysis(datasetId)
      set({ analysis, isLoading: false })
      return analysis
    } catch (err: any) {
      set({ error: err.message || 'Failed to load analysis from API', isLoading: false })
      return null
    }
  },

  uploadFile: async (file: File) => {
    set({ isLoading: true, error: null })
    try {
      const res = await datasetService.upload(file)
      set({
        currentDatasetId: res.dataset_id,
        isLoading: false,
      })
      // Refresh history
      get().loadHistory().catch(() => {})
      return res.dataset_id
    } catch (err: any) {
      set({ error: err.message || 'File upload to backend failed', isLoading: false })
      throw err
    }
  },

  pollStatus: (datasetId: string, onDone: () => void) => {
    let isCancelled = false

    const poll = async () => {
      if (isCancelled) return

      try {
        const statusRes = await datasetService.getStatus(datasetId)
        if (isCancelled) return
        set({ status: statusRes })

        if (statusRes.stage === 'done' || statusRes.progress >= 100) {
          await get().loadAnalysis(datasetId)
          onDone()
        } else if (statusRes.stage === 'failed') {
          set({
            status: {
              stage: 'failed',
              progress: 0,
              error: statusRes.error || 'Pipeline execution failed on the backend.',
            },
          })
        } else {
          // Poll again after 1.2s
          setTimeout(poll, 1200)
        }
      } catch (err: any) {
        if (!isCancelled) {
          set({
            status: {
              stage: 'failed',
              progress: 0,
              error: err.message || 'Backend connection error while polling status',
            },
          })
        }
      }
    }

    poll()

    return () => {
      isCancelled = true
    }
  },

  resetState: () => {
    set({
      analysis: null,
      status: null,
      error: null,
      isLoading: false,
    })
  },
}))
