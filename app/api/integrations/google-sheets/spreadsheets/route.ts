import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase'
import { GoogleSheetsIntegration, GoogleSheetsConfig } from '@/lib/integrations/google-sheets'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const spreadsheetId = searchParams.get('spreadsheetId')

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Spreadsheet ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get Google Sheets integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_type', 'google_sheets')
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Google Sheets integration not found' },
        { status: 404 }
      )
    }

    // Create Google Sheets client
    const googleSheets = new GoogleSheetsIntegration(integration.config as GoogleSheetsConfig)

    // Get spreadsheet info
    const spreadsheet = await googleSheets.getSpreadsheet(spreadsheetId)

    return NextResponse.json(spreadsheet)
  } catch (error) {
    console.error('Error fetching Google Sheets spreadsheet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spreadsheet' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Spreadsheet title is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get Google Sheets integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_type', 'google_sheets')
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Google Sheets integration not found' },
        { status: 404 }
      )
    }

    // Create Google Sheets client
    const googleSheets = new GoogleSheetsIntegration(integration.config as GoogleSheetsConfig)

    // Create new spreadsheet
    const spreadsheet = await googleSheets.createSpreadsheet(title)

    return NextResponse.json(spreadsheet)
  } catch (error) {
    console.error('Error creating Google Sheets spreadsheet:', error)
    return NextResponse.json(
      { error: 'Failed to create spreadsheet' },
      { status: 500 }
    )
  }
}
