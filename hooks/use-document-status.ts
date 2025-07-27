import { useState, useEffect, useRef, useCallback } from 'react'

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

interface UseDocumentStatusOptions {
  documentId: string
  initialStatus?: DocumentStatus
  onComplete?: (data: any) => void
  onError?: (error: string) => void
  enablePolling?: boolean
}

export function useDocumentStatus({
  documentId,
  initialStatus,
  onComplete,
  onError,
  enablePolling = true
}: UseDocumentStatusOptions) {
  const [status, setStatus] = useState<DocumentStatus | null>(initialStatus || null)
  const [loading, setLoading] = useState(!initialStatus)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [pollAttempts, setPollAttempts] = useState(0)
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(true)

  // Helper functions
  const shouldPoll = useCallback((currentStatus: string) => {
    return enablePolling && (currentStatus === 'pending' || currentStatus === 'processing')
  }, [enablePolling])

  const isFinalStatus = useCallback((currentStatus: string) => {
    return currentStatus === 'completed' || currentStatus === 'failed'
  }, [])

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    setIsPolling(false)
  }, [])

  // Fetch status function
  const fetchStatus = useCallback(async (): Promise<DocumentStatus | null> => {
    if (!isActiveRef.current) return null
    
    try {
      setPollAttempts(prev => prev + 1)
      const response = await fetch(`/api/documents/${documentId}/status`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!isActiveRef.current) return null
      
      setStatus(data)
      setLoading(false)
      setError(null)

      return data
    } catch (err) {
      if (!isActiveRef.current) return null
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      clearPolling()
      
      if (onError) {
        onError(errorMessage)
      }
      
      return null
    }
  }, [documentId, onError, clearPolling])

  // Start polling
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current || !isActiveRef.current) return
    
    setIsPolling(true)
    
    pollIntervalRef.current = setInterval(async () => {
      const data = await fetchStatus()
      
      if (data && isFinalStatus(data.processing_status)) {
        clearPolling()
        
        // Handle completion
        if (data.processing_status === 'completed' && onComplete) {
          try {
            const extractedResponse = await fetch(`/api/documents/${documentId}/extracted`)
            if (extractedResponse.ok && isActiveRef.current) {
              const extractedData = await extractedResponse.json()
              onComplete(extractedData)
            }
          } catch (err) {
            console.error('Failed to fetch extracted data:', err)
          }
        }
        
        // Handle errors
        if (data.processing_status === 'failed' && onError) {
          onError(data.error_message || 'Processing failed')
        }
      }
    }, 10000) // 10 second intervals for more responsive updates
  }, [fetchStatus, isFinalStatus, onComplete, onError, clearPolling, documentId])

  // Manual refresh function
  const refreshStatus = useCallback(async () => {
    setLoading(true)
    const data = await fetchStatus()
    
    if (data) {
      if (shouldPoll(data.processing_status) && !isPolling) {
        startPolling()
      } else if (isFinalStatus(data.processing_status)) {
        clearPolling()
      }
    }
  }, [fetchStatus, shouldPoll, isPolling, startPolling, isFinalStatus, clearPolling])

  // Initialize
  useEffect(() => {
    isActiveRef.current = true
    
    const initialize = async () => {
      if (initialStatus) {
        setStatus(initialStatus)
        setLoading(false)
        
        if (shouldPoll(initialStatus.processing_status)) {
          startPolling()
        }
        return
      }
      
      const data = await fetchStatus()
      if (data && shouldPoll(data.processing_status)) {
        startPolling()
      }
    }

    initialize()

    return () => {
      isActiveRef.current = false
      clearPolling()
    }
  }, []) // Only run once

  // Handle status changes
  useEffect(() => {
    if (!status) return
    
    if (isFinalStatus(status.processing_status)) {
      clearPolling()
    } else if (shouldPoll(status.processing_status) && !isPolling) {
      startPolling()
    }
  }, [status?.processing_status, isPolling, isFinalStatus, shouldPoll, startPolling, clearPolling])

  return {
    status,
    loading,
    error,
    isPolling,
    pollAttempts,
    refreshStatus,
    clearPolling
  }
}
