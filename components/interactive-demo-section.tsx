'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  Download,
  Database,
  ArrowRight,
  Sparkles,
  Lock,
  Zap,
  AlertCircle
} from 'lucide-react'

interface ExtractedDataItem {
  key: string
  value: string
  confidence?: number
}

interface DemoState {
  step: 'upload' | 'processing' | 'results' | 'export' | 'error'
  file: File | null
  extractedData: {
    structuredData?: ExtractedDataItem[]
    [key: string]: any
  } | null
  isProcessing: boolean
  error?: string
  documentId?: string
}

export function InteractiveDemoSection() {
  const [demoState, setDemoState] = useState<DemoState>({
    step: 'upload',
    file: null,
    extractedData: null,
    isProcessing: false
  })

  const [loadingSample, setLoadingSample] = useState<string | null>(null)

  // Real PDF processing for demo (in memory, no database)
  const handleFileUpload = useCallback(async (file: File) => {
    setDemoState(prev => ({ ...prev, file, step: 'processing', isProcessing: true, error: undefined }))

    try {
      // Process PDF directly without saving to database
      const formData = new FormData()
      formData.append('file', file)
      formData.append('demo', 'true')
      formData.append('keywords', '') // Empty keywords for demo

      const response = await fetch('/api/demo/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process PDF')
      }

      const { extractedData } = await response.json()

      setDemoState(prev => ({
        ...prev,
        extractedData,
        step: 'results',
        isProcessing: false
      }))

    } catch (error) {
      console.error('Demo processing error:', error)
      setDemoState(prev => ({
        ...prev,
        step: 'error',
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      }))
    }
  }, [])

  const handleExportAttempt = () => {
    setDemoState(prev => ({ ...prev, step: 'export' }))
  }

  const resetDemo = () => {
    setDemoState({
      step: 'upload',
      file: null,
      extractedData: null,
      isProcessing: false,
      error: undefined,
      documentId: undefined
    })
  }

  return (
    <section id="demo" className="py-16 sm:py-20 lg:py-24 bg-slate-900 relative overflow-hidden">
      {/* Minimal dark background with subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header - Simplified */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-100 mb-4 sm:mb-6">
            Try the Demo
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
            Upload a PDF and see AI extract data instantly. No signup required.
          </p>
        </div>

        {/* Interactive Demo Container - Dark Theme */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-4 sm:p-6 lg:p-8 bg-slate-800 border border-slate-700 shadow-2xl mx-4 sm:mx-0">
            <AnimatePresence mode="wait">
              {/* Upload Step */}
              {demoState.step === 'upload' && (
                <div
                  key="upload"
                  className="text-center"
                >
                  <div className="mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-3 sm:mb-4">
                      Upload Your PDF
                    </h3>
                    <p className="text-slate-300 mb-6 sm:mb-8 text-sm sm:text-base px-4 sm:px-0">
                      Try with an invoice, receipt, contract, or any document with structured data
                    </p>
                  </div>

                  {/* File Upload Area */}
                  <div
                    className="border-2 border-dashed border-slate-600 rounded-xl p-6 sm:p-8 lg:p-12 bg-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer touch-manipulation"
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = '.pdf'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handleFileUpload(file)
                      }
                      input.click()
                    }}
                  >
                    <FileText className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-blue-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-semibold text-slate-100 mb-2">
                      <span className="hidden sm:inline">Click to upload or drag and drop</span>
                      <span className="sm:hidden">Tap to upload PDF</span>
                    </p>
                    <p className="text-slate-400 text-sm sm:text-base">
                      PDF files only • Max 10MB
                    </p>
                  </div>

                  {/* Sample Files */}
                  <div className="mt-6 sm:mt-8">
                    <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4">Or try with a sample file:</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                      {[
                        { name: 'Sample Invoice', file: 'sample_invoice.pdf' },
                        { name: 'Sample Receipt', file: 'sample_receipt.pdf' },
                        { name: 'Sample Contract', file: 'sample_contract.pdf' }
                      ].map((sample) => (
                        <Button
                          key={sample.name}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto min-h-[40px] text-xs sm:text-sm text-blue-400 border-slate-600 hover:bg-slate-700 disabled:opacity-50"
                          disabled={loadingSample === sample.name || demoState.isProcessing}
                          onClick={async () => {
                            try {
                              setLoadingSample(sample.name)
                              const response = await fetch(`/${sample.file}`)
                              if (!response.ok) {
                                throw new Error('Failed to load sample file')
                              }
                              const blob = await response.blob()
                              const file = new File([blob], sample.file, { type: 'application/pdf' })
                              await handleFileUpload(file)
                            } catch (error) {
                              console.error('Error loading sample file:', error)
                              setDemoState(prev => ({
                                ...prev,
                                step: 'error',
                                error: 'Failed to load sample file. Please try again.'
                              }))
                            } finally {
                              setLoadingSample(null)
                            }
                          }}
                        >
                          {loadingSample === sample.name ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                              Loading...
                            </div>
                          ) : (
                            sample.name
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Step */}
              {demoState.step === 'processing' && (
                <div
                  key="processing"
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-4">
                    AI is Processing Your PDF
                  </h3>
                  <p className="text-slate-300 mb-8">
                    Our advanced AI is extracting and structuring your data...
                  </p>

                  {/* Processing Steps */}
                  <div className="space-y-4 max-w-md mx-auto">
                    {[
                      { step: 'Analyzing document structure', completed: true },
                      { step: 'Extracting text and data', completed: true },
                      { step: 'Structuring information', completed: false },
                      { step: 'Validating results', completed: false }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center text-left">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                          item.completed ? 'bg-green-500' : 'bg-slate-600'
                        }`}>
                          {item.completed ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <div className="w-2 h-2 bg-slate-400 rounded-full" />
                          )}
                        </div>
                        <span className={item.completed ? 'text-slate-100' : 'text-slate-400'}>
                          {item.step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Step */}
              {demoState.step === 'error' && (
                <div
                  key="error"
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-4">
                    Processing Error
                  </h3>
                  <p className="text-slate-300 mb-8">
                    {demoState.error || 'Something went wrong while processing your PDF. Please try again.'}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={resetDemo}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Try Another File
                    </Button>
                    <SignUpButton>
                      <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        Sign Up for Support
                      </Button>
                    </SignUpButton>
                  </div>
                </div>
              )}

              {/* Results Step */}
              {demoState.step === 'results' && demoState.extractedData && (
                <div
                  key="results"
                >
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100 mb-4">
                      Data Extracted Successfully!
                    </h3>
                    <p className="text-slate-300">
                      {demoState.extractedData.structuredData?.length || 0} fields extracted • Ready for export
                    </p>
                  </div>

                  {/* Extracted Data Preview */}
                  <div className="bg-slate-700 rounded-xl p-6 mb-8">
                    <h4 className="font-semibold text-slate-100 mb-4">Extracted Data:</h4>
                    <div className="space-y-3 text-sm max-h-64 overflow-y-auto">
                      {demoState.extractedData.structuredData?.slice(0, 8).map((item: ExtractedDataItem, index: number) => (
                        <div key={index} className="flex justify-between items-start p-3 bg-slate-800 rounded-lg">
                          <div className="flex-1">
                            <span className="text-slate-400 text-xs uppercase tracking-wide">{item.key}</span>
                            <div className="font-medium text-slate-100">{item.value}</div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-xs text-slate-500">
                              {item.confidence ? Math.round(item.confidence) : 95}% confidence
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center text-slate-400 py-4">
                          No structured data extracted
                        </div>
                      )}
                      {(demoState.extractedData.structuredData?.length || 0) > 8 && (
                        <div className="text-center text-slate-400 text-sm">
                          ... and {(demoState.extractedData.structuredData?.length || 0) - 8} more fields
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handleExportAttempt}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Export to Notion
                    </Button>
                    <Button
                      onClick={handleExportAttempt}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV
                    </Button>
                    <Button
                      onClick={resetDemo}
                      variant="ghost"
                      className="text-slate-400 hover:text-slate-300"
                    >
                      Try Another File
                    </Button>
                  </div>
                </div>
              )}

              {/* Export/Conversion Step */}
              {demoState.step === 'export' && (
                <div
                  key="export"
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-4">
                    Ready to Export Your Data?
                  </h3>
                  <p className="text-slate-300 mb-8 max-w-md mx-auto">
                    Sign up for free to export your extracted data to Notion, download as CSV,
                    and process more documents. No credit card required!
                  </p>

                  {/* Benefits */}
                  <div className="bg-slate-700 rounded-xl p-6 mb-8">
                    <h4 className="font-semibold text-slate-100 mb-4">Free account includes:</h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm text-left">
                      {[
                        'Export to Notion databases',
                        'Download as CSV files',
                        'Process up to 5 PDFs/month',
                        'Save your documents',
                        'Email support',
                        'No credit card required'
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-center text-slate-300">
                          <Zap className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <SignUpButton>
                      <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                      >
                        Create Free Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </SignUpButton>
                    <Button
                      onClick={resetDemo}
                      variant="outline"
                      size="lg"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Try Another PDF
                    </Button>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </section>
  )
}
