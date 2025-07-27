// Export the client and functions for easy importing
export { inngest } from './client'
export { functions, pdfExtractionFunction, pdfExtractionErrorFunction } from './functions'

// Event types for PDF processing
export type PDFProcessingEvents = {
  'pdf/extract.requested': {
    data: {
      documentId: string
      userId: string
      fileName: string
      filePath: string
      keywords?: string
    }
  }
  'pdf/extract.completed': {
    data: {
      documentId: string
      userId: string
      extractedData: Array<{
        field_key: string
        field_value: string
        data_type: string
        confidence: number
      }>
    }
  }
  'pdf/extract.failed': {
    data: {
      documentId: string
      userId: string
      error: string
    }
  }
}
