import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify document extraction system status after Inngest removal
 */
export async function GET() {
  try {
    // Check if required environment variables are present
    const hasGeminiKey = !!process.env.GOOGLE_GEMINI_API_KEY
    const hasSupabaseConfig = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    // Check if Inngest is completely removed
    const inngestRemoved = !process.env.INNGEST_EVENT_KEY && !process.env.INNGEST_SIGNING_KEY
    
    const status = {
      extractionSystem: 'direct-processing',
      inngestStatus: 'removed',
      configuration: {
        geminiAI: hasGeminiKey ? 'configured' : 'missing',
        supabaseConnection: hasSupabaseConfig ? 'configured' : 'missing',
        inngestRemoved: inngestRemoved ? 'yes' : 'still-present'
      },
      endpoints: {
        extraction: '/api/documents/[id]/extract',
        status: '/api/documents/[id]/status',
        extractedData: '/api/documents/[id]/extracted'
      },
      processingFlow: [
        '1. Document upload to Supabase Storage',
        '2. Direct API call to /extract endpoint',
        '3. Immediate processing with Gemini AI',
        '4. Real-time status updates in database',
        '5. Extracted data saved and returned'
      ],
      benefits: [
        'No external job queue dependencies',
        'Faster processing (no queue delays)',
        'Immediate error feedback',
        'Simplified architecture',
        'Lower operational costs'
      ],
      performance: {
        expectedProcessingTime: '10-30 seconds',
        pollingInterval: '5 seconds',
        statusUpdates: 'real-time',
        errorHandling: 'immediate'
      }
    }
    
    return NextResponse.json(status)
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check extraction status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
