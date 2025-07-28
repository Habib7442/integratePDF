import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { extractDataFromPDF, saveExtractedDataToDatabase } from '@/lib/pdf-processing'

// Use service role for server-side operations to bypass RLS
const getSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: documentId } = await params
    const body = await request.json()
    const { keywords = '' } = body

    const supabase = getSupabaseServiceClient()

    // First, get the database user ID from Clerk user ID
    // For new users, we may need to create the user record first
    let userData = null
    let userError = null

    // Try to find existing user
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (existingUser) {
      userData = existingUser
    } else if (findError?.code === 'PGRST116') {
      // User not found - this might be a new user, try to create them
      console.log('User not found, attempting to create user record for:', clerkUserId)

      // User should be created by webhook, but may still be processing
      console.log('User not found, webhook may still be processing. Waiting...')

      // Wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 3000))

      const retryResult = await supabase
        .from('users')
        .select('id, documents_processed, monthly_limit')
        .eq('clerk_user_id', clerkUserId)
        .single()

      if (retryResult.error || !retryResult.data) {
        console.error('User still not found after waiting:', retryResult.error)
        userError = new Error('User account is still being created. Please try again in a moment.')
      } else {
        userData = retryResult.data
        console.log('Found user after waiting:', userData.id)
      }
    } else {
      userError = findError
    }

    if (userError || !userData) {
      console.error('Error finding/creating user:', userError)
      return NextResponse.json({
        error: 'User initialization failed. Please try again in a moment.',
        details: userError?.message || 'User not found'
      }, { status: 404 })
    }

    const dbUserId = userData.id

    // Get document details and verify ownership
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', dbUserId) // Verify ownership
      .single()

    if (docError) {
      console.error('Error fetching document:', docError)
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if document is already being processed or completed
    if (document.processing_status === 'processing') {
      return NextResponse.json({ 
        error: 'Document is already being processed',
        status: 'processing'
      }, { status: 409 })
    }

    // Update document status to pending
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        processing_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('Error updating document status:', updateError)
      return NextResponse.json({ error: 'Failed to update document status' }, { status: 500 })
    }

    // Process document directly (no background job needed)
    try {
      console.log(`Starting direct extraction for document ${documentId}`)

      // Update document status to processing
      await supabase
        .from('documents')
        .update({
          processing_status: 'processing',
          processing_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      // Download file from Supabase Storage
      console.log(`Downloading file: ${document.storage_path}`)
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(document.storage_path)

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`)
      }

      // Convert blob to base64
      const arrayBuffer = await fileData.arrayBuffer()
      const base64Data = Buffer.from(arrayBuffer).toString('base64')

      // Extract data using Gemini AI
      console.log(`Extracting data from: ${document.filename}`)
      const extractedData = await extractDataFromPDF(
        document.filename,
        'application/pdf',
        base64Data,
        keywords.trim() || ''
      )

      // Save extracted data to database
      console.log(`Saving extracted data for document ${documentId}`)
      await saveExtractedDataToDatabase(
        documentId,
        clerkUserId,
        extractedData
      )

      // Update document status to completed
      await supabase
        .from('documents')
        .update({
          processing_status: 'completed',
          processing_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      console.log(`Extraction completed successfully for document ${documentId}`)

      return NextResponse.json({
        success: true,
        message: 'PDF extraction completed successfully',
        documentId,
        status: 'completed',
        extractedData: extractedData.structuredData.map(item => ({
          field_key: item.key,
          field_value: item.value,
          data_type: 'string',
          confidence: item.confidence,
        }))
      })

    } catch (extractionError) {
      console.error('Error during direct extraction:', extractionError)

      // Update document status to failed
      await supabase
        .from('documents')
        .update({
          processing_status: 'failed',
          processing_completed_at: new Date().toISOString(),
          error_message: extractionError instanceof Error ? extractionError.message : 'Unknown extraction error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      return NextResponse.json({
        error: 'Document extraction failed',
        details: extractionError instanceof Error ? extractionError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
