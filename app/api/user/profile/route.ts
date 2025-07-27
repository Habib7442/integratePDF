import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { resolveClerkUserWithRetry, verifyDocumentOwnership } from '@/lib/user-resolution'
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
    
    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(userData)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseServiceClient()

    // Use the robust user resolution function that handles race conditions
    try {
      const dbUserId = await resolveClerkUserWithRetry(clerkUserId)

      // Fetch the complete user profile
      const { data: userProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', dbUserId)
        .single()

      if (fetchError) {
        console.error('Error fetching user profile after resolution:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
      }

      if (!userProfile) {
        console.error('User profile not found after successful resolution')
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      return NextResponse.json(userProfile)

    } catch (resolutionError) {
      console.error('User resolution failed:', resolutionError)

      // Check if it's a validation error (400) or server error (500)
      if (resolutionError instanceof Error) {
        if (resolutionError.message.includes('User data not available') ||
            resolutionError.message.includes('Invalid')) {
          return NextResponse.json({
            error: 'User data validation failed',
            details: resolutionError.message
          }, { status: 400 })
        }
      }

      return NextResponse.json({
        error: 'Failed to create/update profile',
        details: resolutionError instanceof Error ? resolutionError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
