import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Shell } from '../components/layout/Shell'
import { ProcessingStepper } from '../components/processing/ProcessingStepper'
import { useAnalysisStore } from '../store/useAnalysisStore'

export const ProcessingPage: React.FC = () => {
  const { datasetId = '' } = useParams<{ datasetId: string }>()
  const navigate = useNavigate()
  const { status, analysis, pollStatus } = useAnalysisStore()

  const datasetName = analysis?.name || (datasetId ? `Dataset ${datasetId}` : 'Target Dataset')

  useEffect(() => {
    if (!datasetId) {
      navigate('/upload')
      return
    }

    // Start polling status endpoint
    const cancelPolling = pollStatus(datasetId, () => {
      // Confetti burst on completion
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366F1', '#06B6D4', '#10B981', '#F59E0B'],
        })
      } catch (e) {
        // Ignore if confetti unavailable
      }

      // Transition to dashboard after brief pause
      setTimeout(() => {
        navigate(`/dashboard/${datasetId}`)
      }, 1200)
    })

    return () => {
      cancelPolling()
    }
  }, [datasetId, navigate, pollStatus])

  return (
    <Shell>
      <div className="py-8 md:py-16 flex items-center justify-center min-h-[70vh]">
        <ProcessingStepper
          status={status}
          datasetId={datasetId}
          datasetName={datasetName}
          onCancel={() => navigate('/upload')}
          onComplete={() => navigate(`/dashboard/${datasetId}`)}
        />
      </div>
    </Shell>
  )
}
