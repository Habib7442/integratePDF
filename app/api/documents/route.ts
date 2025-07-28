import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClerkSupabaseClient()

    // Get user's documents using RLS
    // The JWT token automatically filters to the current user's documents
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select(`
        *,
        users!inner(clerk_user_id)
      `)
      .eq('users.clerk_user_id', clerkUserId)
      .order('created_at', { ascending: false })

    if (documentsError) {
      console.error('Error fetching documents:', documentsError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    return NextResponse.json(documents || [])

  } catch (error) {
    console.error('API error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('User not found')) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
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
