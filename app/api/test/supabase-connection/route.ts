import { NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Environment check:', {
      hasUrl,
      hasKey,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
    })

    if (!hasUrl || !hasKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        details: { hasUrl, hasKey }
      }, { status: 500 })
    }

    const supabase = getSupabaseServiceClient()
    
    // Simple test query
    console.log('Executing test query...')
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({
        error: 'Supabase query failed',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 })
    }

    console.log('Supabase connection successful:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      data
    })

  } catch (error) {
    console.error('Connection test error:', error)
    return NextResponse.json({
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
