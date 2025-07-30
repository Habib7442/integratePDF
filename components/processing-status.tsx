'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, CheckCircle, AlertCircle, Clock, FileText, Zap, Wifi, RefreshCw } from 'lucide-react'
import { useDocumentStatus } from '@/hooks/use-document-status'

interface ProcessingStatusProps {
  documentId: string
  onComplete?: (data: any) => void
  onError?: (error: string) => void
  initialStatus?: DocumentStatus // Allow passing initial status to avoid first fetch
}

interface DocumentStatus {
  id: string
  filename: string
  processing_status: 'uploaded' | 'pending' | 'processing' | 'completed' | 'failed'
  processing_started_at?: string
  processing_completed_at?: string
  processing_duration_seconds?: number
  confidence_score?: number
  error_message?: string
  extracted_fields_count: number
}

export default function ProcessingStatus({
  documentId,
  onComplete,
  onError,
  initialStatus
}: ProcessingStatusProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const {
    status,
    loading,
    error,
    isPolling,
    pollAttempts,
    refreshStatus
  } = useDocumentStatus({
    documentId,
    initialStatus,
    onComplete,
    onError,
    enablePolling: true
  })

  // Elapsed time tracking for processing status
  useEffect(() => {
    if (status?.processing_status === 'processing') {
      timeIntervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current)
        timeIntervalRef.current = null
      }
      if (status?.processing_status !== 'processing') {
        setElapsedTime(0)
      }
    }

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current)
        timeIntervalRef.current = null
      }
    }
  }, [status?.processing_status])

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    
    switch (status?.processing_status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-600" />
      case 'processing':
        return <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-600" />
      default:
        return <FileText className="h-6 w-6 text-gray-600" />
    }
  }

  const getStatusMessage = () => {
    if (loading) return 'Loading document status...'
    if (error) return `Error: ${error}`
    
    switch (status?.processing_status) {
      case 'pending':
        return 'Starting extraction...'
      case 'processing':
        return 'Extracting data from PDF...'
      case 'completed':
        return `Extraction completed! Found ${status.extracted_fields_count} fields.`
      case 'failed':
        return `Processing failed: ${status.error_message}`
      default:
        return 'Unknown status'
    }
  }

  const getProgressPercentage = () => {
    if (!status) return 0
    
    switch (status.processing_status) {
      case 'pending':
        return 10
      case 'processing':
        return 50
      case 'completed':
        return 100
      case 'failed':
        return 100
      default:
        return 0
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          <span className="text-slate-300">Loading document status...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Status Check Failed</h3>
            <p className="text-sm text-slate-300">Unable to fetch document status</p>
          </div>
        </div>
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <p className="text-sm text-red-300">{error}</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-red-400">
              Polling stopped to prevent further errors.
            </p>
            <button
              onClick={refreshStatus}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-red-900/20 text-red-300 border border-red-600 rounded-md hover:bg-red-900/30 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-100">
                  Processing Status
                </h3>
                {isPolling && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-900/20 text-blue-400 border border-blue-600 rounded-full text-xs">
                    <Wifi className="h-3 w-3" />
                    <span>Live updates</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-300">{status?.filename}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {status?.processing_status === 'processing' && (
              <div className="flex items-center gap-2 text-blue-400">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {formatDuration(elapsedTime)} elapsed
                </span>
              </div>
            )}

            {isPolling && (
              <div className="text-xs text-slate-400">
                Checking every 15s (#{pollAttempts})
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Progress</span>
            <span className="text-slate-100 font-medium">{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                status?.processing_status === 'failed' 
                  ? 'bg-red-500' 
                  : status?.processing_status === 'completed'
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">{getStatusMessage()}</p>
        </div>

        {/* Completion Details */}
        {status?.processing_status === 'completed' && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Processing Time</p>
              <p className="text-sm font-medium text-gray-900">
                {status.processing_duration_seconds 
                  ? formatDuration(status.processing_duration_seconds)
                  : 'N/A'
                }
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Confidence Score</p>
              <p className="text-sm font-medium text-gray-900">
                {status.confidence_score 
                  ? `${Math.round(status.confidence_score * 100)}%`
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        )}

        {/* Error Details */}
        {status?.processing_status === 'failed' && status.error_message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{status.error_message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
