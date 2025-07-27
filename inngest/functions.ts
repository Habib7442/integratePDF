import { inngest } from './client'
import { extractDataFromPDF, saveExtractedDataToDatabase } from '@/lib/pdf-processing'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role key
const getSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

// PDF Extraction Function
export const pdfExtractionFunction = inngest.createFunction(
  { id: 'pdf-extraction' },
  { event: 'pdf/extract.requested' },
  async ({ event, step }) => {
    const { documentId, userId, fileName, filePath, keywords } = event.data

    // Step 1: Update document status to processing
    await step.run('update-processing-status', async () => {
      const supabase = getSupabaseServiceClient()
      
      const { error } = await supabase
        .from('documents')
        .update({
          processing_status: 'processing',
          processing_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      if (error) {
        throw new Error(`Failed to update document status: ${error.message}`)
      }

      return { status: 'processing_started' }
    })

    // Step 2: Download file from Supabase Storage
    const fileData = await step.run('download-file', async () => {
      const supabase = getSupabaseServiceClient()
      
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath)

      if (error) {
        throw new Error(`Failed to download file: ${error.message}`)
      }

      // Convert blob to base64
      const arrayBuffer = await data.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      
      return {
        base64Data: base64,
        mimeType: 'application/pdf'
      }
    })

    // Step 3: Extract data using Gemini AI
    const extractedData = await step.run('extract-data', async () => {
      try {
        const result = await extractDataFromPDF(
          fileName,
          fileData.mimeType,
          fileData.base64Data,
          keywords || ''
        )
        
        return result
      } catch (error) {
        console.error('Extraction failed:', error)
        throw new Error(`Data extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })

    // Step 4: Save extracted data to database
    const saveResult = await step.run('save-extracted-data', async () => {
      try {
        const result = await saveExtractedDataToDatabase(
          documentId,
          userId,
          extractedData
        )
        
        return result
      } catch (error) {
        console.error('Save failed:', error)
        throw new Error(`Failed to save extracted data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })

    // Step 5: Send completion event
    await step.sendEvent('send-completion-event', {
      name: 'pdf/extract.completed',
      data: {
        documentId,
        userId,
        extractedData: extractedData.structuredData.map(item => ({
          field_key: item.key,
          field_value: item.value,
          data_type: 'string',
          confidence: item.confidence,
        }))
      }
    })

    return {
      success: true,
      documentId,
      extractedCount: saveResult.extractedCount,
      averageConfidence: extractedData.structuredData.reduce((avg, item) => avg + item.confidence, 0) / extractedData.structuredData.length
    }
  }
)

// Error handling function
export const pdfExtractionErrorFunction = inngest.createFunction(
  { id: 'pdf-extraction-error' },
  { event: 'pdf/extract.failed' },
  async ({ event }) => {
    const { documentId, userId, error } = event.data
    
    console.error(`PDF extraction failed for document ${documentId}:`, error)
    
    // Update document with error status
    const supabase = getSupabaseServiceClient()
    await supabase
      .from('documents')
      .update({
        processing_status: 'failed',
        processing_completed_at: new Date().toISOString(),
        error_message: error,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    return { success: true, errorLogged: true }
  }
)

// Export all functions as an array for easy importing
export const functions = [
  pdfExtractionFunction,
  pdfExtractionErrorFunction,
]
