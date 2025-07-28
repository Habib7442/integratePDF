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

    // Verify document ownership and get document data
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json(document)

  } catch (error) {
    console.error('API error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('User not found')) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      if (error.message.includes('Document not found') || error.message.includes('access denied')) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      if (error.message.includes('22P02')) {
        return NextResponse.json({ error: 'Invalid UUID format' }, { status: 400 })
      }
    }
    
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(
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

    // Verify document ownership and get document data
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, storage_path')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete from storage first if storage_path exists
    if (document.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.storage_path])

      if (storageError) {
        console.error('Error deleting from storage:', storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete the document (this will cascade delete related data)
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      console.error('Error deleting document:', deleteError)
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Document deleted successfully' })

  } catch (error) {
    console.error('API error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('User not found')) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      if (error.message.includes('Document not found') || error.message.includes('access denied')) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      if (error.message.includes('22P02')) {
        return NextResponse.json({ error: 'Invalid UUID format' }, { status: 400 })
      }
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
