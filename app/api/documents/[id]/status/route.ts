import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for server-side operations to bypass RLS
const getSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: documentId } = await params
    const supabase = getSupabaseServiceClient()

    // Get user from database using Clerk ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get document processing status with ownership verification
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        id,
        filename,
        processing_status,
        processing_started_at,
        processing_completed_at,
        confidence_score,
        error_message,
        created_at,
        updated_at
      `)
      .eq('id', documentId)
      .eq('user_id', user.id) // Verify ownership
      .single()

    if (docError) {
      console.error('Error fetching document:', docError)
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Calculate processing duration if applicable
    let processingDuration = null
    if (document.processing_started_at && document.processing_completed_at) {
      const startTime = new Date(document.processing_started_at).getTime()
      const endTime = new Date(document.processing_completed_at).getTime()
      processingDuration = Math.round((endTime - startTime) / 1000) // in seconds
    }

    // Get count of extracted fields if processing is completed
    let extractedFieldsCount = 0
    if (document.processing_status === 'completed') {
      const { count } = await supabase
        .from('extracted_data')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', documentId)
      
      extractedFieldsCount = count || 0
    }

    return NextResponse.json({
      id: document.id,
      filename: document.filename,
      processing_status: document.processing_status,
      processing_started_at: document.processing_started_at,
      processing_completed_at: document.processing_completed_at,
      processing_duration_seconds: processingDuration,
      confidence_score: document.confidence_score,
      error_message: document.error_message,
      extracted_fields_count: extractedFieldsCount,
      created_at: document.created_at,
      updated_at: document.updated_at
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
