import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  verifyDocumentOwnership,
  getExtractedDataWithOwnership,
  updateExtractedFieldWithOwnership
} from '@/lib/user-resolution'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: documentId } = await params

    // Verify document ownership and get document data
    const { document } = await verifyDocumentOwnership(documentId, clerkUserId)

    // Get extracted data with ownership verification
    const extractedData = await getExtractedDataWithOwnership(documentId, clerkUserId)

    // Calculate processing statistics
    const totalFields = extractedData?.length || 0
    const averageConfidence = totalFields > 0
      ? extractedData.reduce((sum, item) => sum + (item.confidence || 0), 0) / totalFields
      : 0
    const correctedFields = extractedData?.filter(item => item.is_corrected).length || 0

    return NextResponse.json({
      document: {
        id: document.id,
        filename: document.filename,
        processing_status: document.processing_status,
        processing_started_at: document.processing_started_at,
        processing_completed_at: document.processing_completed_at,
        confidence_score: document.confidence_score,
        error_message: document.error_message,
        created_at: document.created_at,
        updated_at: document.updated_at
      },
      extracted_data: extractedData || [],
      statistics: {
        total_fields: totalFields,
        average_confidence: Math.round(averageConfidence * 100) / 100,
        corrected_fields: correctedFields,
        correction_rate: totalFields > 0 ? Math.round((correctedFields / totalFields) * 100) : 0
      }
    })

  } catch (error) {
    console.error('API error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('User not found')) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      if (error.message.includes('Document not found') || error.message.includes('access denied')) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      if (error.message.includes('22P02')) {
        return NextResponse.json({ error: 'Invalid UUID format' }, { status: 400 })
      }
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT endpoint to update extracted data (for manual corrections)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: documentId } = await params
    const body = await request.json()
    const { field_id, field_value, is_corrected = true } = body

    if (!field_id || field_value === undefined) {
      return NextResponse.json({
        error: 'field_id and field_value are required'
      }, { status: 400 })
    }

    // Update the field with ownership verification
    const updatedField = await updateExtractedFieldWithOwnership(
      field_id,
      documentId,
      clerkUserId,
      field_value,
      is_corrected
    )

    return NextResponse.json({
      success: true,
      message: 'Field updated successfully',
      updated_field: updatedField
    })

  } catch (error) {
    console.error('API error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('User not found')) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      if (error.message.includes('Document not found') || error.message.includes('access denied')) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      if (error.message.includes('Field not found')) {
        return NextResponse.json({ error: 'Field not found' }, { status: 404 })
      }
      if (error.message.includes('22P02')) {
        return NextResponse.json({ error: 'Invalid UUID format' }, { status: 400 })
      }
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
