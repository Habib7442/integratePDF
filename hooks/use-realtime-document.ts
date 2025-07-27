import { useState, useEffect, useRef, useCallback } from 'react'
import { useSupabase } from './use-supabase'
import { Document, ExtractedData } from '@/stores/types'

interface UseRealtimeDocumentOptions {
  documentId: string
  onDocumentUpdate?: (document: Document) => void
  onExtractionComplete?: (data: ExtractedData) => void
  onError?: (error: string) => void
}

export function useRealtimeDocument({
  documentId,
  onDocumentUpdate,
  onExtractionComplete,
  onError
}: UseRealtimeDocumentOptions) {
  const { supabase, user } = useSupabase()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const subscriptionRef = useRef<any>(null)
  const isActiveRef = useRef(true)

  // Fetch document data
  const fetchDocument = useCallback(async () => {
    if (!user || !documentId) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/documents/${documentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch document')
      }

      const documentData = await response.json()
      setDocument(documentData)
      
      if (onDocumentUpdate) {
        onDocumentUpdate(documentData)
      }

      // If document is completed and we haven't fetched extracted data yet, fetch it
      if (documentData.processing_status === 'completed') {
        await fetchExtractedData()
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch document'
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [user, documentId, onDocumentUpdate, onError])

  // Fetch extracted data
  const fetchExtractedData = useCallback(async () => {
    if (!user || !documentId) return

    try {
      const response = await fetch(`/api/documents/${documentId}/extracted`)
      if (response.ok) {
        const extractedData = await response.json()
        if (onExtractionComplete && isActiveRef.current) {
          onExtractionComplete(extractedData)
        }
      }
    } catch (err) {
      console.error('Failed to fetch extracted data:', err)
    }
  }, [user, documentId, onExtractionComplete])

  // Set up real-time subscription
  useEffect(() => {
    if (!user || !documentId || !supabase) return

    // Initial fetch
    fetchDocument()

    // Set up real-time subscription for document updates
    const channel = supabase
      .channel(`document-${documentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${documentId}`
        },
        async (payload) => {
          if (!isActiveRef.current) return

          const updatedDocument = payload.new as Document
          setDocument(updatedDocument)
          
          if (onDocumentUpdate) {
            onDocumentUpdate(updatedDocument)
          }

          // If document just completed, fetch extracted data
          if (updatedDocument.processing_status === 'completed') {
            // Small delay to ensure data is fully saved
            setTimeout(() => {
              fetchExtractedData()
            }, 1000)
          }
        }
      )
      .subscribe()

    subscriptionRef.current = channel

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [user, documentId, supabase, fetchDocument, fetchExtractedData, onDocumentUpdate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false
      if (subscriptionRef.current && supabase) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [supabase])

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchDocument()
  }, [fetchDocument])

  return {
    document,
    isLoading,
    error,
    refresh
  }
}
