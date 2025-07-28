import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseServiceClient } from '@/lib/supabase'

/**
 * Temporary API route to sync user profile using service role
 * This bypasses RLS for initial testing
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, we'll create a basic user record with just the Clerk ID
    // The actual user data will be populated by the UserSync component on the client side
    console.log('Creating/updating user record for Clerk ID:', clerkUserId)

    const email = ''
    const first_name = null
    const last_name = null
    const avatar_url = null

    console.log('Syncing user via API:', { clerkUserId, email, first_name, last_name, avatar_url })

    const supabase = getSupabaseServiceClient()

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json({ 
        error: 'Database error', 
        details: fetchError.message 
      }, { status: 500 })
    }

    const userData = {
      clerk_user_id: clerkUserId,
      email: email,
      first_name: first_name,
      last_name: last_name,
      avatar_url: avatar_url,
      updated_at: new Date().toISOString(),
    }

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(userData)
        .eq('clerk_user_id', clerkUserId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.json({ 
          error: 'Failed to update user', 
          details: updateError.message 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        user: updatedUser, 
        action: 'updated' 
      })
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          ...userData,
          subscription_tier: 'free',
          documents_processed: 0,
          monthly_limit: 10,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ 
          error: 'Failed to create user', 
          details: createError.message 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        user: newUser, 
        action: 'created' 
      })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
