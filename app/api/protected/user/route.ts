import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClerkSupabaseClient()
    
    // Get or create user profile
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({ user: existingUser })
    }

    // User doesn't exist - this should be handled by Clerk webhook
    // Return 404 to indicate user needs to be created via webhook first
    console.log(`User not found for Clerk ID: ${userId}. User should be created via webhook.`)
    return NextResponse.json({
      error: 'User profile not found. Please try again in a moment.'
    }, { status: 404 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, first_name, last_name, avatar_url } = body

    const supabase = await createClerkSupabaseClient()
    
    const { data, error } = await supabase
      .from('users')
      .update({
        email,
        first_name,
        last_name,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
