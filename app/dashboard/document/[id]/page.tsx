'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDocuments, useUI, useNotifications } from '@/components/providers/store-provider'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'
import ExtractionTrigger from '@/components/extraction-trigger'
import ProcessingStatus from '@/components/processing-status'
import ResultsWithIntegration from '@/components/integrations/ResultsWithIntegration'

interface Document {
  id: string
  filename: string
  file_size: number
  file_type: string
  processing_status: 'uploaded' | 'pending' | 'processing' | 'completed' | 'failed'
  confidence_score: number | null
  created_at: string
}

interface ExtractedData {
  document: {
    id: string
    filename: string
    processing_status: string
    confidence_score: number
    processing_completed_at: string
  }
  extracted_data: Array<{
    id: string
    field_key: string
    field_value: string
    confidence: number
    is_corrected: boolean
    data_type: string
  }>
  statistics: {
    total_fields: number
    average_confidence: number
    corrected_fields: number
    correction_rate: number
  }
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string

  // Zustand stores
  const {
    currentDocument: document,
    extractedData,
    isLoading,
    error,
    fetchDocument,
    fetchExtractedData,
    updateExtractedField,
    startExtraction
  } = useDocuments()

  const {
    showProcessingStatus,
    setShowProcessingStatus,
    setProcessingDocumentId
  } = useUI()

  const { showSuccessNotification, showErrorNotification } = useNotifications()

  // Fetch document details - only run once on mount
  useEffect(() => {
    if (documentId) {
      // Fetch document
      fetchDocument(documentId).then(() => {
        // If document is completed, fetch extracted data
        if (document?.processing_status === 'completed') {
          fetchExtractedData(documentId).catch((err) => {
            console.error('Failed to fetch extracted data:', err)
            showErrorNotification('Error', 'Failed to load extracted data')
          })
        }

        // Show processing status if document is being processed
        if (document?.processing_status === 'pending' || document?.processing_status === 'processing') {
          setShowProcessingStatus(true)
          setProcessingDocumentId(documentId)
        }
      }).catch((err) => {
        console.error('Failed to fetch document:', err)
        showErrorNotification('Error', 'Failed to load document')
      })
    }
  }, [documentId, fetchDocument, fetchExtractedData, showErrorNotification, setShowProcessingStatus, setProcessingDocumentId])

  // Update processing status when document status changes
  useEffect(() => {
    if (document) {
      const shouldShowProcessing = document.processing_status === 'pending' || document.processing_status === 'processing'
      setShowProcessingStatus(shouldShowProcessing)

      if (shouldShowProcessing) {
        setProcessingDocumentId(documentId)
      } else {
        setProcessingDocumentId(null)
      }

      // Fetch extracted data when document becomes completed
      if (document.processing_status === 'completed' && !extractedData) {
        fetchExtractedData(documentId).catch((err) => {
          console.error('Failed to fetch extracted data:', err)
          showErrorNotification('Error', 'Failed to load extracted data')
        })
      }
    }
  }, [document?.processing_status, documentId, extractedData, fetchExtractedData, setShowProcessingStatus, setProcessingDocumentId, showErrorNotification])

  const handleExtractionStarted = async (keywords?: string) => {
    try {
      await startExtraction(documentId, keywords)
      setShowProcessingStatus(true)
      setProcessingDocumentId(documentId)
      showSuccessNotification('Success', 'Extraction started successfully')
    } catch (err) {
      console.error('Failed to start extraction:', err)
      showErrorNotification('Error', 'Failed to start extraction')
    }
  }

  const handleProcessingComplete = (data: ExtractedData) => {
    setShowProcessingStatus(false)
    setProcessingDocumentId(null)
    showSuccessNotification('Success', 'Document processing completed!')
  }

  const handleProcessingError = (errorMessage: string) => {
    setShowProcessingStatus(false)
    setProcessingDocumentId(null)
    showErrorNotification('Processing Failed', errorMessage)
  }

  const handleFieldUpdate = async (fieldId: string, newValue: string) => {
    try {
      await updateExtractedField(documentId, fieldId, newValue)
      showSuccessNotification('Success', 'Field updated successfully')
    } catch (err) {
      showErrorNotification('Error', err instanceof Error ? err.message : 'Failed to update field')
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading document...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Document Not Found</h2>
          <p className="text-gray-600 mb-4">The requested document could not be found.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{document.filename}</h1>
              <p className="text-gray-600">
                {(document.file_size / 1024 / 1024).toFixed(2)} MB • {document.file_type} • 
                Uploaded {new Date(document.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Extraction Trigger */}
          {(document.processing_status === 'uploaded' || document.processing_status === 'pending' || document.processing_status === 'failed') && (
            <ExtractionTrigger
              document={document}
              onExtractionStarted={handleExtractionStarted}
              onError={handleProcessingError}
            />
          )}

          {/* Processing Status */}
          {showProcessingStatus && (
            <ProcessingStatus
              documentId={documentId}
              onComplete={handleProcessingComplete}
              onError={handleProcessingError}
              initialStatus={document ? {
                id: document.id,
                filename: document.filename,
                processing_status: document.processing_status,
                processing_started_at: undefined,
                processing_completed_at: undefined,
                processing_duration_seconds: undefined,
                confidence_score: document.confidence_score || undefined,
                error_message: undefined,
                extracted_fields_count: 0
              } : undefined}
            />
          )}

          {/* Extraction Results */}
          {extractedData && (
            <ResultsWithIntegration
              document={extractedData.document}
              extractedData={extractedData.extracted_data}
              statistics={extractedData.statistics}
              onFieldUpdate={handleFieldUpdate}
              onRetryExtraction={() => {
                setShowProcessingStatus(true)
                setProcessingDocumentId(documentId)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
