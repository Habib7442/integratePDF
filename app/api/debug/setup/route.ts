import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseServiceClient } from '@/lib/supabase'

/**
 * Debug endpoint to check Supabase-Clerk integration setup
 */
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()
    
    const results = {
      timestamp: new Date().toISOString(),
      clerk: {
        authenticated: !!clerkUserId,
        userId: clerkUserId || null,
      },
      supabase: {
        connection: false,
        tablesExist: false,
        rlsEnabled: false,
        userCount: 0,
      },
      environment: {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        clerkSecretKey: !!process.env.CLERK_SECRET_KEY,
        jwtTemplate: process.env.CLERK_JWT_TEMPLATE_NAME || 'not set',
      },
      errors: [] as string[],
    }

    // Test Supabase connection
    try {
      const supabase = getSupabaseServiceClient()
      
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (testError) {
        results.errors.push(`Supabase connection failed: ${testError.message}`)
      } else {
        results.supabase.connection = true
        results.supabase.tablesExist = true
      }

      // Check user count
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (!countError) {
        results.supabase.userCount = count || 0
      }

      // Check if RLS is enabled (this will fail if not properly set up)
      const { data: rlsData, error: rlsError } = await supabase
        .rpc('pg_get_rls_enabled', { table_name: 'users' })

      if (!rlsError) {
        results.supabase.rlsEnabled = true
      }

    } catch (supabaseError) {
      results.errors.push(`Supabase error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`)
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      results.errors.push('Missing NEXT_PUBLIC_SUPABASE_URL')
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      results.errors.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      results.errors.push('Missing SUPABASE_SERVICE_ROLE_KEY')
    }
    if (!process.env.CLERK_SECRET_KEY) {
      results.errors.push('Missing CLERK_SECRET_KEY')
    }

    return NextResponse.json(results)

  } catch (error) {
    return NextResponse.json({
      error: 'Debug check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
