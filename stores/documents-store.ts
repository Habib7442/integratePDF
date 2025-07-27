import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Document, ExtractedData, DocumentStatus } from './types'

interface DocumentsState {
  // State
  documents: Document[]
  currentDocument: Document | null
  extractedData: ExtractedData | null
  isLoading: boolean
  isUploading: boolean
  error: string | null
  
  // Processing state
  processingDocuments: Set<string>
  documentStatuses: Map<string, DocumentStatus>
  
  // Actions
  setDocuments: (documents: Document[]) => void
  setCurrentDocument: (document: Document | null) => void
  setExtractedData: (data: ExtractedData | null) => void
  setLoading: (loading: boolean) => void
  setUploading: (uploading: boolean) => void
  setError: (error: string | null) => void
  
  // Document management
  addDocument: (document: Document) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  removeDocument: (id: string) => void
  
  // Processing management
  setDocumentProcessing: (id: string, processing: boolean) => void
  updateDocumentStatus: (id: string, status: DocumentStatus) => void
  
  // Async actions
  fetchDocuments: () => Promise<void>
  fetchDocument: (id: string) => Promise<void>
  uploadDocument: (file: File, documentType?: string) => Promise<Document>
  deleteDocument: (id: string) => Promise<void>
  deleteMultipleDocuments: (ids: string[]) => Promise<{ success: string[], failed: string[] }>
  fetchExtractedData: (documentId: string) => Promise<void>
  updateExtractedField: (documentId: string, fieldId: string, value: string) => Promise<void>
  startExtraction: (documentId: string, keywords?: string) => Promise<void>
}

export const useDocumentsStore = create<DocumentsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      documents: [],
      currentDocument: null,
      extractedData: null,
      isLoading: false,
      isUploading: false,
      error: null,
      processingDocuments: new Set(),
      documentStatuses: new Map(),

      // Actions
      setDocuments: (documents) =>
        set({
          documents: documents.filter(doc => doc && doc.id) // Filter out invalid documents
        }, false, 'setDocuments'),
      
      setCurrentDocument: (document) => 
        set({ currentDocument: document }, false, 'setCurrentDocument'),
      
      setExtractedData: (data) => 
        set({ extractedData: data }, false, 'setExtractedData'),
      
      setLoading: (loading) => 
        set({ isLoading: loading }, false, 'setLoading'),
      
      setUploading: (uploading) => 
        set({ isUploading: uploading }, false, 'setUploading'),
      
      setError: (error) => 
        set({ error }, false, 'setError'),

      // Document management
      addDocument: (document) =>
        set((state) => {
          // Validate document has required fields
          if (!document || !document.id) {
            console.error('Invalid document:', document)
            return state
          }

          // Check if document already exists to prevent duplicates
          const existingIndex = state.documents.findIndex(doc => doc.id === document.id)
          if (existingIndex !== -1) {
            // Update existing document instead of adding duplicate
            const updatedDocuments = [...state.documents]
            updatedDocuments[existingIndex] = document
            return { documents: updatedDocuments }
          }

          return { documents: [document, ...state.documents] }
        }, false, 'addDocument'),
      
      updateDocument: (id, updates) => 
        set((state) => ({
          documents: state.documents.map(doc => 
            doc.id === id ? { ...doc, ...updates } : doc
          ),
          currentDocument: state.currentDocument?.id === id 
            ? { ...state.currentDocument, ...updates }
            : state.currentDocument
        }), false, 'updateDocument'),
      
      removeDocument: (id) => 
        set((state) => ({
          documents: state.documents.filter(doc => doc.id !== id),
          currentDocument: state.currentDocument?.id === id ? null : state.currentDocument
        }), false, 'removeDocument'),

      // Processing management
      setDocumentProcessing: (id, processing) => 
        set((state) => {
          const newProcessing = new Set(state.processingDocuments)
          if (processing) {
            newProcessing.add(id)
          } else {
            newProcessing.delete(id)
          }
          return { processingDocuments: newProcessing }
        }, false, 'setDocumentProcessing'),
      
      updateDocumentStatus: (id, status) => 
        set((state) => {
          const newStatuses = new Map(state.documentStatuses)
          newStatuses.set(id, status)
          return { documentStatuses: newStatuses }
        }, false, 'updateDocumentStatus'),

      // Async actions
      fetchDocuments: async () => {
        const { setLoading, setError, setDocuments } = get()
        
        try {
          setLoading(true)
          setError(null)

          const response = await fetch('/api/documents')
          if (!response.ok) {
            throw new Error('Failed to fetch documents')
          }

          const documents = await response.json()
          setDocuments(documents)

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch documents'
          setError(errorMessage)
          console.error('Fetch documents error:', error)
        } finally {
          setLoading(false)
        }
      },

      fetchDocument: async (id: string) => {
        const { setLoading, setError, setCurrentDocument } = get()
        
        try {
          setLoading(true)
          setError(null)

          const response = await fetch(`/api/documents/${id}`)
          if (!response.ok) {
            throw new Error('Document not found')
          }

          const document = await response.json()
          setCurrentDocument(document)

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch document'
          setError(errorMessage)
          console.error('Fetch document error:', error)
        } finally {
          setLoading(false)
        }
      },

      uploadDocument: async (file: File, documentType?: string) => {
        const { setUploading, setError, addDocument } = get()

        try {
          setUploading(true)
          setError(null)

          const formData = new FormData()
          formData.append('file', file)
          if (documentType) {
            formData.append('documentType', documentType)
          }

          const response = await fetch('/api/protected/documents', {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            // Try to get the error message from the response
            let errorMessage = 'Failed to upload document'
            try {
              const errorData = await response.json()
              if (errorData.error) {
                // Handle specific error cases
                if (response.status === 429) {
                  errorMessage = `Monthly limit reached (${errorData.processed}/${errorData.limit} documents used). Please upgrade your plan to upload more documents.`
                } else {
                  errorMessage = errorData.error
                }
              }
            } catch (parseError) {
              // If we can't parse the error response, use status-based message
              if (response.status === 429) {
                errorMessage = 'Monthly document limit reached. Please upgrade your plan to upload more documents.'
              }
            }
            throw new Error(errorMessage)
          }

          const result = await response.json()
          const document = result.document || result
          addDocument(document)
          return document

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload document'
          setError(errorMessage)
          console.error('Upload document error:', error)
          throw error
        } finally {
          setUploading(false)
        }
      },

      deleteDocument: async (id: string) => {
        const { setLoading, setError, removeDocument } = get()
        
        try {
          setLoading(true)
          setError(null)

          const response = await fetch(`/api/documents/${id}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            throw new Error('Failed to delete document')
          }

          removeDocument(id)

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete document'
          setError(errorMessage)
          console.error('Delete document error:', error)
        } finally {
          setLoading(false)
        }
      },

      deleteMultipleDocuments: async (ids: string[]) => {
        const { setLoading, setError, removeDocument } = get()

        try {
          setLoading(true)
          setError(null)

          const results = { success: [] as string[], failed: [] as string[] }

          // Delete documents one by one to handle individual failures
          for (const id of ids) {
            try {
              const response = await fetch(`/api/documents/${id}`, {
                method: 'DELETE'
              })

              if (!response.ok) {
                throw new Error(`Failed to delete document ${id}`)
              }

              removeDocument(id)
              results.success.push(id)
            } catch (error) {
              console.error(`Failed to delete document ${id}:`, error)
              results.failed.push(id)
            }
          }

          return results

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete documents'
          setError(errorMessage)
          console.error('Delete multiple documents error:', error)
          throw error
        } finally {
          setLoading(false)
        }
      },

      fetchExtractedData: async (documentId: string) => {
        const { setLoading, setError, setExtractedData } = get()
        
        try {
          setLoading(true)
          setError(null)

          const response = await fetch(`/api/documents/${documentId}/extracted`)
          if (!response.ok) {
            throw new Error('Failed to fetch extracted data')
          }

          const data = await response.json()
          setExtractedData(data)

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch extracted data'
          setError(errorMessage)
          console.error('Fetch extracted data error:', error)
        } finally {
          setLoading(false)
        }
      },

      updateExtractedField: async (documentId: string, fieldId: string, value: string) => {
        const { setError, extractedData, setExtractedData } = get()
        
        try {
          setError(null)

          const response = await fetch(`/api/documents/${documentId}/extracted`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              field_id: fieldId,
              field_value: value,
              is_corrected: true
            })
          })

          if (!response.ok) {
            throw new Error('Failed to update field')
          }

          // Update local state optimistically
          if (extractedData) {
            const updatedData = {
              ...extractedData,
              extracted_data: extractedData.extracted_data.map(field =>
                field.id === fieldId 
                  ? { ...field, field_value: value, is_corrected: true }
                  : field
              )
            }
            
            // Recalculate statistics
            const correctedFields = updatedData.extracted_data.filter(f => f.is_corrected).length
            updatedData.statistics.corrected_fields = correctedFields
            updatedData.statistics.correction_rate = 
              updatedData.statistics.total_fields > 0 
                ? Math.round((correctedFields / updatedData.statistics.total_fields) * 100)
                : 0
            
            setExtractedData(updatedData)
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update field'
          setError(errorMessage)
          console.error('Update field error:', error)
          throw error
        }
      },

      startExtraction: async (documentId: string, keywords?: string) => {
        const { setError, setDocumentProcessing, updateDocument } = get()
        
        try {
          setError(null)
          setDocumentProcessing(documentId, true)

          const response = await fetch(`/api/documents/${documentId}/extract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords: keywords || '' })
          })

          if (!response.ok) {
            throw new Error('Failed to start extraction')
          }

          // Update document status to pending
          updateDocument(documentId, { processing_status: 'pending' })

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to start extraction'
          setError(errorMessage)
          setDocumentProcessing(documentId, false)
          console.error('Start extraction error:', error)
          throw error
        }
      }
    }),
    { name: 'DocumentsStore' }
  )
)
