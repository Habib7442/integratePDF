import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClerkSupabaseClient()

    // Get user profile using RLS (Row Level Security)
    // The JWT token automatically filters to the current user
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

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, first_name, last_name, avatar_url } = body

    const supabase = await createClerkSupabaseClient()

    // Update user profile using RLS
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        email,
        first_name,
        last_name,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', clerkUserId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}


