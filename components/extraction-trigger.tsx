'use client'

import { useState } from 'react'
import { Zap, FileText, Tag, AlertCircle, Loader2 } from 'lucide-react'
import KeywordInput from '@/components/integrations/KeywordInput'

interface ExtractionTriggerProps {
  document: {
    id: string
    filename: string
    processing_status: string
  }
  onExtractionStarted?: () => void
  onError?: (error: string) => void
}

export default function ExtractionTrigger({ 
  document, 
  onExtractionStarted, 
  onError 
}: ExtractionTriggerProps) {
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canStartExtraction = document.processing_status === 'uploaded' ||
                           document.processing_status === 'pending' ||
                           document.processing_status === 'failed'

  const handleStartExtraction = async (retryCount = 0) => {
    if (!canStartExtraction || loading) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/documents/${document.id}/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: keywords.trim()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle specific error cases for better user experience
        if (response.status === 404 && (
          errorData.error?.includes('User initialization failed') ||
          errorData.error?.includes('User not found')
        )) {
          // For new users, retry once after a short delay
          if (retryCount === 0) {
            setError('Setting up your account... Retrying in a moment.')
            await new Promise(resolve => setTimeout(resolve, 2000))
            return handleStartExtraction(1) // Retry once
          } else {
            const isDev = process.env.NODE_ENV === 'development'
            const devMessage = isDev
              ? ' In development, use the "Create User" button on the dashboard or set up webhooks with ngrok.'
              : ''
            throw new Error(`Account setup is taking longer than expected. Please refresh the page and try again.${devMessage}`)
          }
        } else {
          throw new Error(errorData.error || 'Failed to start extraction')
        }
      }

      const result = await response.json()

      if (onExtractionStarted) {
        onExtractionStarted()
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (document.processing_status) {
      case 'uploaded':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-400 bg-blue-900/20 border border-blue-600 rounded-full">
            <FileText className="h-3 w-3" />
            Ready for extraction
          </span>
        )
      case 'processing':
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-400 bg-blue-900/20 border border-blue-600 rounded-full">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-400 bg-green-900/20 border border-green-600 rounded-full">
            <Zap className="h-3 w-3" />
            Completed
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-400 bg-red-900/20 border border-red-600 rounded-full">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        )
      default:
        return null
    }
  }

  const suggestedKeywords = [
    'invoice, amount, date, vendor',
    'contract, parties, terms, duration',
    'receipt, total, tax, items',
    'report, summary, metrics, data'
  ]

  return (
    <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/20 rounded-lg">
              <Zap className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Extract Data
              </h3>
              <p className="text-sm text-slate-300">{document.filename}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Keywords Input */}
        {canStartExtraction && (
          <div className="space-y-3">
            <KeywordInput
              value={keywords}
              onChange={setKeywords}
              disabled={loading}
              placeholder="Enter keywords to focus extraction on specific data (e.g., invoice, amount, date, vendor)"
            />

            {/* Suggested Keywords */}
            <div>
              <p className="text-xs font-medium text-slate-300 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedKeywords.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setKeywords(suggestion)}
                    className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors"
                    disabled={loading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          {canStartExtraction ? (
            <button
              onClick={handleStartExtraction}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {loading ? 'Starting Extraction...' : 'Start Extraction'}
            </button>
          ) : (
            <div className="text-sm text-slate-400">
              {document.processing_status === 'completed'
                ? 'Extraction already completed'
                : document.processing_status === 'processing'
                ? 'Extraction in progress...'
                : 'Extraction queued'
              }
            </div>
          )}
        </div>

        {/* Info Box */}
        {canStartExtraction && (
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium">How it works:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• AI analyzes your PDF and extracts structured data</li>
                  <li>• Keywords help focus on specific information</li>
                  <li>• You can review and correct extracted data</li>
                  <li>• Processing typically takes 10-30 seconds</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
