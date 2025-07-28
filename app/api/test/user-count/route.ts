import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User count API - Clerk User ID:', clerkUserId)
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...'
    })

    const supabase = getSupabaseServiceClient()

    // Count total users - use a simple approach
    console.log('Querying total users...')
    let totalCount = 0
    let allUsers = null

    try {
      const result = await supabase
        .from('users')
        .select('id')

      if (result.error) {
        console.error('Error counting total users:', result.error)
        return NextResponse.json({
          error: 'Failed to count users',
          details: result.error.message
        }, { status: 500 })
      }

      allUsers = result.data
      totalCount = allUsers ? allUsers.length : 0
      console.log('Total users found:', totalCount)
    } catch (queryError) {
      console.error('Query exception:', queryError)
      return NextResponse.json({
        error: 'Query failed with exception',
        details: queryError instanceof Error ? queryError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Count users for current Clerk ID
    console.log('Querying users for Clerk ID:', clerkUserId)
    let userCount = 0
    let currentUserRecords = null

    try {
      const result = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)

      if (result.error) {
        console.error('Error counting user instances:', result.error)
        return NextResponse.json({
          error: 'Failed to count user instances',
          details: result.error.message
        }, { status: 500 })
      }

      currentUserRecords = result.data
      userCount = currentUserRecords ? currentUserRecords.length : 0
      console.log('User instances found:', userCount)
    } catch (queryError) {
      console.error('User query exception:', queryError)
      return NextResponse.json({
        error: 'User query failed with exception',
        details: queryError instanceof Error ? queryError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Get actual user records for current Clerk ID
    let userRecords = null

    try {
      const result = await supabase
        .from('users')
        .select('id, email, first_name, last_name, created_at')
        .eq('clerk_user_id', clerkUserId)

      if (result.error) {
        console.error('Error fetching user records:', result.error)
        return NextResponse.json({
          error: 'Failed to fetch user records',
          details: result.error.message
        }, { status: 500 })
      }

      userRecords = result.data
    } catch (queryError) {
      console.error('Records query exception:', queryError)
      return NextResponse.json({
        error: 'Records query failed with exception',
        details: queryError instanceof Error ? queryError.message : 'Unknown error'
      }, { status: 500 })
    }

    console.log('User count API results:', {
      totalCount,
      userCount,
      userRecordsLength: userRecords ? userRecords.length : 0,
      clerkUserId
    })

    return NextResponse.json({
      count: totalCount,
      userInstances: userCount,
      userRecords: userRecords || [],
      clerkUserId
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
