import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getSupabaseServiceClient } from '@/lib/supabase'

/**
 * Development-only endpoint to manually create users when webhooks aren't working
 * This is useful for local development when ngrok isn't set up
 */
export async function POST(req: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get full user details from Clerk
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 })
    }

    const supabase = getSupabaseServiceClient()
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', checkError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existingUser) {
      console.log('User already exists:', existingUser.email)
      return NextResponse.json({ 
        message: 'User already exists', 
        user: existingUser,
        action: 'found_existing'
      })
    }

    // Extract email from Clerk user
    const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress || 'dev@example.com'

    // Create user manually with Clerk data
    const userData = {
      clerk_user_id: userId,
      email,
      first_name: clerkUser.firstName || 'Dev',
      last_name: clerkUser.lastName || 'User',
      avatar_url: clerkUser.imageUrl || null,
      subscription_tier: 'free' as const,
      documents_processed: 0,
      monthly_limit: 10,
    }

    console.log('Creating dev user with data:', userData)

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json({ 
        error: 'Failed to create user', 
        details: createError.message 
      }, { status: 500 })
    }

    console.log('✅ Dev user created successfully:', newUser.email)
    return NextResponse.json({ 
      message: 'User created successfully', 
      user: newUser,
      action: 'created_new'
    })

  } catch (error) {
    console.error('Error in dev user creation:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET endpoint to check if user exists
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = getSupabaseServiceClient()
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ 
      exists: !!user,
      user: user || null
    })

  } catch (error) {
    console.error('Error checking user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
