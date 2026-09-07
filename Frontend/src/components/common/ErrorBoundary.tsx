import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-500/20 bg-rose-950/10 backdrop-blur-sm m-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Rendering Error</h3>
          <p className="text-sm text-gray-400 max-w-md mb-6">
            {this.state.error?.message || 'An unexpected error occurred while rendering this module.'}
          </p>
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => this.setState({ hasError: false })}
          >
            Reload Module
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
