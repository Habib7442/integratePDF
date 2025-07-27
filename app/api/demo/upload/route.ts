import { NextRequest, NextResponse } from 'next/server'
import { extractDataFromPDF } from '@/lib/pdf-processing'
import { validateFile } from '@/lib/file-validation'
import { createRateLimitMiddleware, rateLimitConfigs } from '@/lib/rate-limit'

// Create rate limit middleware for demo uploads
const rateLimitMiddleware = createRateLimitMiddleware(rateLimitConfigs.upload)

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = rateLimitMiddleware(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const isDemo = formData.get('demo') === 'true'
    const keywords = formData.get('keywords') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Enhanced file validation
    const validationResult = await validateFile(file)
    if (!validationResult.isValid) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 })
    }

    // Log warnings if any
    if (validationResult.warnings) {
      console.warn('File validation warnings:', validationResult.warnings)
    }

    if (!isDemo) {
      return NextResponse.json({ error: 'This endpoint is for demo purposes only' }, { status: 400 })
    }

    // Convert file to base64 for processing
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')

    // Process the PDF directly in memory
    const extractedData = await extractDataFromPDF(
      file.name,
      file.type,
      base64Data,
      keywords
    )

    return NextResponse.json({
      success: true,
      extractedData,
      message: 'PDF processed successfully'
    })

  } catch (error) {
    console.error('Demo processing error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Processing failed'
    }, { status: 500 })
  }
}
