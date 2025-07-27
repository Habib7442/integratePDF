import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { resolveClerkUserWithRetry } from '@/lib/user-resolution'
import { createClient } from '@supabase/supabase-js'

// Use service role for server-side operations to bypass RLS
const getSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseServiceClient()
    
    // First, get the database user ID from Clerk user ID with retry logic
    const dbUserId = await resolveClerkUserWithRetry(clerkUserId)
    
    // Get all documents for this user
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', dbUserId)
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
