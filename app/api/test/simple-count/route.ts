import { NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Simple count API called')
    
    const supabase = getSupabaseServiceClient()
    
    // Simple count query
    const { data, error } = await supabase
      .from('users')
      .select('id')
    
    if (error) {
      console.error('Simple count error:', error)
      return NextResponse.json({
        error: 'Query failed',
        details: error.message
      }, { status: 500 })
    }
    
    const count = data ? data.length : 0
    
    return NextResponse.json({
      success: true,
      count,
      message: `Found ${count} users`
    })
    
  } catch (error) {
    console.error('Simple count exception:', error)
    return NextResponse.json({
      error: 'Exception occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
