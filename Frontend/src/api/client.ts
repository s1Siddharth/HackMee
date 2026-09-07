import axios from 'axios'

// Configurable base URL as requested in the prompt: VITE_API_BASE_URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Attach auth token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aia_auth_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
