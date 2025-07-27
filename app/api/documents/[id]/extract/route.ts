import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { inngest } from '@/inngest'

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
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !userData) {
      console.error('Error finding user:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

    // Send event to Inngest for background processing
    try {
      await inngest.send({
        name: 'pdf/extract.requested',
        data: {
          documentId,
          userId: clerkUserId, // Use Clerk user ID for the background job
          fileName: document.filename,
          filePath: document.storage_path,
          keywords: keywords.trim()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'PDF extraction started',
        documentId,
        status: 'pending'
      })

    } catch (inngestError) {
      console.error('Error sending Inngest event:', inngestError)
      
      // Revert document status if Inngest fails
      await supabase
        .from('documents')
        .update({
          processing_status: 'failed',
          error_message: 'Failed to queue extraction job',
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      return NextResponse.json({ 
        error: 'Failed to start extraction process' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
