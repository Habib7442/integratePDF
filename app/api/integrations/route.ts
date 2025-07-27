import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { encryptApiKey } from '@/lib/encryption'

// Use service role for server-side operations to bypass RLS
const getSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseServiceClient()

    // First, get the database user ID from Clerk user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (userError || !userData) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's integrations
    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching integrations:', error)
      return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 })
    }

    return NextResponse.json(integrations)
  } catch (error) {
    console.error('Error in GET /api/integrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, config, name } = await request.json()

    if (!type || !config) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabaseServiceClient()

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Encrypt sensitive data in config (like API keys)
    const secureConfig = { ...config }
    if (secureConfig.api_key) {
      secureConfig.api_key = encryptApiKey(secureConfig.api_key)
    }

    // Create integration
    const { data: integration, error } = await supabase
      .from('integrations')
      .insert({
        user_id: userData.id,
        integration_type: type,
        integration_name: name || type,
        config: secureConfig,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating integration:', error)
      return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 })
    }

    return NextResponse.json(integration, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/integrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
