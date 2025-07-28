import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { getSupabaseServiceClient } from '@/lib/supabase'

/**
 * API route to sync user profile using service role with actual Clerk data
 * This creates/updates user records with proper data from Clerk
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Syncing user record for Clerk ID:', clerkUserId)

    // Get actual user data from Clerk
    let clerkUser
    try {
      const client = await clerkClient()
      clerkUser = await client.users.getUser(clerkUserId)
    } catch (clerkError) {
      console.error('Failed to fetch user from Clerk:', clerkError)
      return NextResponse.json({
        error: 'Failed to fetch user data from Clerk',
        details: clerkError instanceof Error ? clerkError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Extract user data from Clerk
    const email = clerkUser.emailAddresses[0]?.emailAddress || ''
    const first_name = clerkUser.firstName || null
    const last_name = clerkUser.lastName || null
    const avatar_url = clerkUser.imageUrl || null

    console.log('Syncing user with data:', { clerkUserId, email, first_name, last_name, avatar_url: !!avatar_url })

    const supabase = getSupabaseServiceClient()

    // Check if user exists (and check for duplicates)
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)

    if (fetchError) {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json({
        error: 'Database error',
        details: fetchError.message
      }, { status: 500 })
    }

    // Handle duplicates - if multiple users exist, keep the one with most complete data
    let existingUser = null
    if (existingUsers && existingUsers.length > 0) {
      if (existingUsers.length > 1) {
        console.warn(`Found ${existingUsers.length} duplicate users for Clerk ID ${clerkUserId}`)

        // Sort by completeness (email, then created_at)
        existingUsers.sort((a, b) => {
          const aScore = (a.email ? 1 : 0) + (a.first_name ? 1 : 0) + (a.last_name ? 1 : 0)
          const bScore = (b.email ? 1 : 0) + (b.first_name ? 1 : 0) + (b.last_name ? 1 : 0)

          if (aScore !== bScore) return bScore - aScore // Higher score first
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime() // Older first
        })

        existingUser = existingUsers[0]

        // Delete duplicates (keep the first one)
        for (let i = 1; i < existingUsers.length; i++) {
          const duplicate = existingUsers[i]
          console.log(`Deleting duplicate user ${duplicate.id}`)

          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', duplicate.id)

          if (deleteError) {
            console.error(`Failed to delete duplicate user ${duplicate.id}:`, deleteError)
          }
        }
      } else {
        existingUser = existingUsers[0]
      }
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
