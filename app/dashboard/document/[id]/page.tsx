'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useDocuments, useUI, useNotifications } from '@/components/providers/store-provider'
import { ArrowLeft, FileText, Loader2, Home, Calendar, Database, TrendingUp, Sparkles } from 'lucide-react'
import ExtractionTrigger from '@/components/extraction-trigger'
import ProcessingStatus from '@/components/processing-status'
import ResultsWithIntegration from '@/components/integrations/ResultsWithIntegration'
import { useRealtimeDocument } from '@/hooks/use-realtime-document'

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

  // Temporarily disable real-time updates to fix infinite loop
  // const { refresh: refreshDocument } = useRealtimeDocument({
  //   documentId,
  //   onDocumentUpdate: (updatedDocument) => {
  //     // The real-time hook already updates the document state
  //     // No need to call fetchDocument again
  //   },
  //   onExtractionComplete: (extractedData) => {
  //     // Refresh extracted data when processing completes
  //     fetchExtractedData(documentId).then(() => {
  //       showSuccessNotification('Success', 'Document processing completed! Data is now available.')
  //     }).catch((err) => {
  //       console.error('Failed to fetch extracted data after completion:', err)
  //       showErrorNotification('Error', 'Processing completed but failed to load extracted data')
  //     })
  //   },
  //   onError: (error) => {
  //     showErrorNotification('Real-time Update Error', error)
  //   }
  // })

  // Fetch document details - only run once on mount
  useEffect(() => {
    if (documentId) {
      fetchDocument(documentId).catch((err) => {
        console.error('Failed to fetch document:', err)
        showErrorNotification('Error', 'Failed to load document')
      })
    }
  }, [documentId]) // Only depend on documentId to prevent infinite loop

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
  }, [document?.processing_status, documentId, extractedData]) // Removed function dependencies to prevent infinite loop

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

    // The real-time hook will handle data refresh automatically
    // Just show a notification here
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center px-4">
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4 bg-white/80 backdrop-blur-sm px-6 sm:px-8 py-6 rounded-2xl shadow-lg border border-slate-200 max-w-sm sm:max-w-md w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div className="absolute inset-0 h-8 w-8 border-2 border-blue-200 rounded-full animate-pulse" />
          </div>
          <span className="text-base sm:text-lg font-medium text-slate-700 text-center sm:text-left">Loading document...</span>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center px-4">
        <motion.div
          className="text-center bg-white/80 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 max-w-sm sm:max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Error Loading Document</h2>
          <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8">{error}</p>
          <motion.button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 min-h-[44px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center px-4">
        <motion.div
          className="text-center bg-white/80 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 max-w-sm sm:max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Document Not Found</h2>
          <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8">The requested document could not be found or may have been deleted.</p>
          <motion.button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 min-h-[44px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgb(59 130 246) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <motion.div
          className="mb-8 sm:mb-10 lg:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <motion.button
              onClick={() => router.push('/dashboard')}
              className="flex items-center justify-center sm:justify-start gap-2 text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 min-h-[44px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm sm:text-base">Back to Dashboard</span>
            </motion.button>

            <motion.button
              onClick={() => router.push('/')}
              className="flex items-center justify-center sm:justify-start gap-2 text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 min-h-[44px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="h-4 w-4" />
              <span className="text-sm sm:text-base">Home</span>
            </motion.button>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3 sm:mb-4 text-center sm:text-left break-words">
                  {document.filename}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Database className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-xs sm:text-sm text-slate-500">File Size</div>
                      <div className="font-semibold text-slate-900 text-sm sm:text-base">
                        {(document.file_size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-xs sm:text-sm text-slate-500">File Type</div>
                      <div className="font-semibold text-slate-900 text-sm sm:text-base">{document.file_type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-center sm:justify-start sm:col-span-2 lg:col-span-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-xs sm:text-sm text-slate-500">Uploaded</div>
                      <div className="font-semibold text-slate-900 text-sm sm:text-base">
                        {new Date(document.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Extraction Trigger */}
          {(document.processing_status === 'uploaded' || document.processing_status === 'pending' || document.processing_status === 'failed') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ExtractionTrigger
                document={document}
                onExtractionStarted={handleExtractionStarted}
                onError={handleProcessingError}
              />
            </motion.div>
          )}

          {/* Processing Status */}
          {showProcessingStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
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
            </motion.div>
          )}

          {/* Extraction Results */}
          {extractedData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
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
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
