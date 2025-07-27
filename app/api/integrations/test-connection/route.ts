import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { NotionIntegration } from '@/lib/integrations/notion'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, config } = await request.json()

    if (!type || !config) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let result = {
      success: false,
      error: null as string | null,
      details: {
        connection: false,
        authentication: false,
        permissions: false,
        dataValidation: false
      },
      suggestions: [] as string[]
    }

    try {
      switch (type) {
        case 'notion':
          if (!config.api_key) {
            return NextResponse.json({ 
              ...result,
              error: 'API key is required',
              suggestions: ['Please provide a valid Notion API key']
            }, { status: 400 })
          }

          const notionClient = new NotionIntegration(config.api_key)
          
          // Test basic connection
          const connectionTest = await notionClient.testConnection()
          if (!connectionTest) {
            return NextResponse.json({
              ...result,
              error: 'Failed to connect to Notion API',
              suggestions: [
                'Check that your API key is correct and starts with "secret_"',
                'Ensure your integration has been created in Notion',
                'Verify your internet connection'
              ]
            }, { status: 401 })
          }

          result.details.connection = true
          result.details.authentication = true

          // Test database access if database ID provided
          if (config.database_id) {
            try {
              await notionClient.getDatabase(config.database_id)
              result.details.permissions = true
              result.details.dataValidation = true
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error'
              
              if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                return NextResponse.json({
                  ...result,
                  error: 'Database not found or not accessible',
                  suggestions: [
                    'Check that the database ID is correct',
                    'Ensure the database is shared with your integration',
                    'Verify the database exists and is not deleted'
                  ]
                }, { status: 404 })
              } else if (errorMessage.includes('403') || errorMessage.includes('permission')) {
                return NextResponse.json({
                  ...result,
                  error: 'Permission denied to access database',
                  suggestions: [
                    'Share the database with your integration in Notion',
                    'Check that your integration has the correct permissions',
                    'Ensure your integration has access to the workspace'
                  ]
                }, { status: 403 })
              } else {
                return NextResponse.json({
                  ...result,
                  error: `Database access failed: ${errorMessage}`,
                  suggestions: [
                    'Check the database ID format',
                    'Verify your integration permissions'
                  ]
                }, { status: 400 })
              }
            }
          }

          result.success = true
          result.suggestions = ['Integration is ready to use!']
          break

        case 'airtable':
          return NextResponse.json({
            ...result,
            error: 'Airtable integration not yet implemented',
            suggestions: ['Airtable support is coming soon']
          }, { status: 501 })

        case 'quickbooks':
          return NextResponse.json({
            ...result,
            error: 'QuickBooks integration not yet implemented',
            suggestions: ['QuickBooks support is coming soon']
          }, { status: 501 })

        default:
          return NextResponse.json({
            ...result,
            error: 'Unknown integration type',
            suggestions: ['Please select a supported integration type']
          }, { status: 400 })
      }

      return NextResponse.json(result)
    } catch (error) {
      console.error('Error testing integration:', error)
      return NextResponse.json({
        ...result,
        error: error instanceof Error ? error.message : 'Integration test failed',
        suggestions: [
          'Check your internet connection',
          'Verify your API credentials',
          'Try again in a few moments'
        ]
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in POST /api/integrations/test-connection:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      suggestions: ['Please try again later']
    }, { status: 500 })
  }
}
