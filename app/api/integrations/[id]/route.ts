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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: integrationId } = await params
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

    // Get integration
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('user_id', userData.id)
      .single()

    if (error) {
      console.error('Error fetching integration:', error)
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    return NextResponse.json(integration)
  } catch (error) {
    console.error('Error in GET /api/integrations/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: integrationId } = await params
    const { config, name, is_active } = await request.json()

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

    // Update integration
    const updateData: any = { updated_at: new Date().toISOString() }
    if (config !== undefined) {
      // Encrypt sensitive data in config (like API keys)
      const secureConfig = { ...config }
      if (secureConfig.api_key) {
        secureConfig.api_key = encryptApiKey(secureConfig.api_key)
      }
      updateData.config = secureConfig
    }
    if (name !== undefined) updateData.integration_name = name
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: integration, error } = await supabase
      .from('integrations')
      .update(updateData)
      .eq('id', integrationId)
      .eq('user_id', userData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating integration:', error)
      return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 })
    }

    return NextResponse.json(integration)
  } catch (error) {
    console.error('Error in PATCH /api/integrations/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: integrationId } = await params
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

    // Delete integration
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', integrationId)
      .eq('user_id', userData.id)

    if (error) {
      console.error('Error deleting integration:', error)
      return NextResponse.json({ error: 'Failed to delete integration' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/integrations/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
