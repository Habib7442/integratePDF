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

      try {
        // Call the user sync API to create the user
        const userSyncResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': request.headers.get('Authorization') || '',
            'Cookie': request.headers.get('Cookie') || ''
          },
          body: JSON.stringify({})
        })

        if (userSyncResponse.ok) {
          const syncResult = await userSyncResponse.json()
          userData = syncResult.user
          console.log('Successfully created user record:', userData.id)
        } else {
          const syncError = await userSyncResponse.json()
          console.error('Failed to create user via sync API:', syncError)
          userError = new Error(`Failed to initialize user: ${syncError.error}`)
        }
      } catch (syncError) {
        console.error('Error calling user sync API:', syncError)
        userError = syncError
      }

      // If sync failed, try one more direct query in case user was created by another process
      if (!userData) {
        const { data: retryUser } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_user_id', clerkUserId)
          .single()

        if (retryUser) {
          userData = retryUser
          userError = null
        }
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
