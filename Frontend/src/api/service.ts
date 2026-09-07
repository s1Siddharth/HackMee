import { apiClient, API_BASE_URL } from './client'
import {
  AnalysisResponse,
  HistoryItem,
  StatusResponse,
  UploadResponse,
} from './types'

class DatasetService {
  /**
   * POST /upload
   * Sends multipart file to FastAPI backend.
   * Returns {dataset_id} immediately; pipeline runs in background.
   */
  async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<UploadResponse>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      // No timeout override — large files can take a moment to read
    })
    return response.data
  }

  /**
   * GET /status/{dataset_id}
   * Polls the processing stage & progress from backend.
   */
  async getStatus(datasetId: string): Promise<StatusResponse> {
    const response = await apiClient.get<StatusResponse>(`/status/${datasetId}`)
    return response.data
  }

  /**
   * GET /analysis/{dataset_id}
   * Fetches the full analysis result once status is "done".
   */
  async getAnalysis(datasetId: string): Promise<AnalysisResponse> {
    const response = await apiClient.get<AnalysisResponse>(`/analysis/${datasetId}`)
    return response.data
  }

  /**
   * GET /history
   * Retrieves all past processed datasets from backend.
   */
  async getHistory(): Promise<HistoryItem[]> {
    const response = await apiClient.get<HistoryItem[]>('/history')
    return response.data
  }

  /**
   * POST /chat/stream  (SSE)
   * Streams AI assistant tokens via Server-Sent Events.
   *
   * @param message       - User's question
   * @param datasetId     - Optional; injects real dataset context into system prompt
   * @param onToken       - Called with each streamed text token
   * @param onDone        - Called when stream finishes
   * @param onError       - Called on error
   * @returns AbortController.abort() to cancel the stream
   */
  streamChat(
    message: string,
    datasetId: string | null,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: string) => void,
  ): () => void {
    const controller = new AbortController()

    const run = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            dataset_id: datasetId ?? null,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const text = await response.text()
          onError(`Backend error ${response.status}: ${text}`)
          return
        }

        const reader = response.body?.getReader()
        if (!reader) {
          onError('No response body from backend')
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') {
              onDone()
              return
            }
            try {
              const parsed = JSON.parse(payload)
              if (parsed.text) onToken(parsed.text)
            } catch {
              // skip malformed line
            }
          }
        }
        onDone()
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          onError((err as Error).message || 'Stream connection failed')
        }
      }
    }

    run()
    return () => controller.abort()
  }
}

export const datasetService = new DatasetService()
