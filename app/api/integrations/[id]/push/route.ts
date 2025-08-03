import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NotionIntegration } from '@/lib/integrations/notion'
import { GoogleSheetsIntegration, GoogleSheetsConfig } from '@/lib/integrations/google-sheets'

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
    const { documentId, data, mapping } = await request.json()

    if (!documentId || !data) {
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

    // Verify document belongs to user
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, filename')
      .eq('id', documentId)
      .eq('user_id', userData.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    let result: any
    let externalId: string | null = null

    try {
      switch (integration.integration_type) {
        case 'notion':
          if (!integration.config.api_key || !integration.config.database_id) {
            throw new Error('Notion API key and database ID are required')
          }
          
          const notionClient = new NotionIntegration(integration.config.api_key)
          
          // Use provided mapping or generate default mapping
          const fieldMapping = mapping || {}
          
          result = await notionClient.pushExtractedData(
            integration.config.database_id,
            data,
            fieldMapping
          )
          
          externalId = result.id
          break

        case 'google_sheets':
          const googleSheetsClient = new GoogleSheetsIntegration(integration.config as GoogleSheetsConfig)

          // Use provided mapping or generate default mapping
          const sheetsMapping = mapping || {}

          result = await googleSheetsClient.pushExtractedData(
            data,
            sheetsMapping,
            {
              spreadsheetId: integration.config.spreadsheet_id,
              sheetName: integration.config.sheet_name,
              createHeaders: true,
              documentName: document.filename
            }
          )

          // Use the actual spreadsheet ID from the result (in case a new one was created)
          const actualSpreadsheetId = result.spreadsheetId || integration.config.spreadsheet_id
          externalId = `${actualSpreadsheetId}:${result.sheetName || integration.config.sheet_name}`
          break

        case 'airtable':
          throw new Error('Airtable integration not yet implemented')

        case 'quickbooks':
          throw new Error('QuickBooks integration not yet implemented')

        default:
          throw new Error('Unknown integration type')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Push failed'
      console.error('Error pushing data to integration:', {
        integrationId: integrationId,
        integrationType: integration.integration_type,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      })

      // Log the push attempt
      await supabase
        .from('push_history')
        .insert({
          user_id: userData.id,
          document_id: documentId,
          integration_id: integrationId,
          success: false,
          error_message: errorMessage,
          pushed_at: new Date().toISOString()
        })

      return NextResponse.json({ 
        success: false, 
        error: errorMessage 
      }, { status: 400 })
    }

    // Log successful push
    const pushRecord = {
      user_id: userData.id,
      document_id: documentId,
      integration_id: integrationId,
      success: true,
      external_id: externalId,
      pushed_at: new Date().toISOString()
    }

    await supabase
      .from('push_history')
      .insert(pushRecord)

    // Update integration last_sync
    await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', integrationId)

    return NextResponse.json({
      success: true,
      integration_id: integrationId,
      external_id: externalId,
      pushed_at: pushRecord.pushed_at,
      result
    })
  } catch (error) {
    console.error('Error in POST /api/integrations/[id]/push:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
