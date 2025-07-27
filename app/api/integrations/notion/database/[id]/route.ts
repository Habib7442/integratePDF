import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { NotionIntegration } from '@/lib/integrations/notion'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: databaseId } = await params
    const body = await request.json()
    const { api_key: apiKey } = body

    if (!apiKey || !databaseId) {
      return NextResponse.json({ error: 'API key and database ID are required' }, { status: 400 })
    }

    try {
      const notionClient = new NotionIntegration(apiKey)
      const database = await notionClient.getDatabase(databaseId)

      return NextResponse.json(database)
    } catch (error) {
      console.error('Error fetching Notion database:', error)
      return NextResponse.json({
        error: error instanceof Error ? error.message : 'Failed to fetch database'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in POST /api/integrations/notion/database/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
