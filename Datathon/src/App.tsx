import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { UploadPage } from './pages/UploadPage'
import { ProcessingPage } from './pages/ProcessingPage'
import { DashboardPage } from './pages/DashboardPage'
import { useAuthStore } from './store/useAuthStore'
import { useAnalysisStore } from './store/useAnalysisStore'
import { useThemeStore } from './store/useThemeStore'

function DashboardRedirect() {
  const currentDatasetId = useAnalysisStore((state) => state.currentDatasetId)
  if (currentDatasetId) {
    return <Navigate to={`/dashboard/${currentDatasetId}`} replace />
  }
  return <Navigate to="/upload" replace />
}

export function App() {
  const initializeAuth = useAuthStore((state) => state.initialize)
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
    initializeAuth()
  }, [initTheme, initializeAuth])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/processing/:datasetId" element={<ProcessingPage />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/dashboard/:datasetId" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
