import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NotionIntegration } from '@/lib/integrations/notion'

// Use service role for server-side operations to bypass RLS
const getSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(
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

    if (error || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Test connection based on integration type
    let success = false
    let errorMessage = ''

    try {
      switch (integration.integration_type) {
        case 'notion':
          if (!integration.config.api_key) {
            throw new Error('API key is required')
          }
          
          const notionClient = new NotionIntegration(integration.config.api_key)
          success = await notionClient.testConnection()
          
          if (success && integration.config.database_id) {
            // Also test database access
            await notionClient.getDatabase(integration.config.database_id)
          }
          break
          
        case 'airtable':
          // TODO: Implement Airtable connection test
          throw new Error('Airtable integration not yet implemented')
          
        case 'quickbooks':
          // TODO: Implement QuickBooks connection test
          throw new Error('QuickBooks integration not yet implemented')
          
        default:
          throw new Error('Unknown integration type')
      }
    } catch (error) {
      success = false
      errorMessage = error instanceof Error ? error.message : 'Connection test failed'
    }

    // Update last_sync if successful
    if (success) {
      await supabase
        .from('integrations')
        .update({ 
          last_sync: new Date().toISOString(),
          is_active: true 
        })
        .eq('id', integrationId)
    }

    return NextResponse.json({ 
      success, 
      error: success ? null : errorMessage 
    })
  } catch (error) {
    console.error('Error in POST /api/integrations/[id]/test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
