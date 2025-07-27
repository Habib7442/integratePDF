import { NextRequest, NextResponse } from 'next/server'
import { extractDataFromPDF } from '@/lib/pdf-processing'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const isDemo = formData.get('demo') === 'true'
    const keywords = formData.get('keywords') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 })
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
