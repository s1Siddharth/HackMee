import { apiClient } from './client'
import {
  AnalysisResponse,
  HistoryItem,
  StatusResponse,
  UploadResponse
} from './types'

class DatasetService {
  /**
   * POST /upload
   * Sends multipart file to FastAPI backend
   */
  async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  /**
   * GET /status/{dataset_id}
   * Polls processing stage from backend
   */
  async getStatus(datasetId: string): Promise<StatusResponse> {
    const response = await apiClient.get<StatusResponse>(`/status/${datasetId}`)
    return response.data
  }

  /**
   * GET /analysis/{dataset_id}
   * Fetches full analysis data from backend
   */
  async getAnalysis(datasetId: string): Promise<AnalysisResponse> {
    const response = await apiClient.get<AnalysisResponse>(`/analysis/${datasetId}`)
    return response.data
  }

  /**
   * GET /history
   * Retrieves past datasets from backend
   */
  async getHistory(): Promise<HistoryItem[]> {
    const response = await apiClient.get<HistoryItem[]>('/history')
    return response.data
  }
}

export const datasetService = new DatasetService()
