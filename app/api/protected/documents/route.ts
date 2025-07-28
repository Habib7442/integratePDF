import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { validateFile, sanitizeFileName } from '@/lib/file-validation'
import { createRateLimitMiddleware, rateLimitConfigs } from '@/lib/rate-limit'

// Create rate limit middleware for uploads
const uploadRateLimitMiddleware = createRateLimitMiddleware(rateLimitConfigs.upload)

// Use service role for server-side operations to bypass RLS
const getSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseServiceClient()

    // Get user from database using Clerk ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's documents
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        *,
        extracted_data (
          id,
          field_key,
          field_value,
          data_type,
          confidence,
          is_corrected
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    return NextResponse.json(documents)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = uploadRateLimitMiddleware(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

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

    const supabase = getSupabaseServiceClient()

    // Get user ID from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, documents_processed, monthly_limit')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check monthly limit
    if (user.documents_processed >= user.monthly_limit) {
      return NextResponse.json({ 
        error: 'Monthly document limit reached',
        limit: user.monthly_limit,
        processed: user.documents_processed
      }, { status: 429 })
    }

    // Upload file to Supabase Storage with sanitized filename
    const sanitizedOriginalName = sanitizeFileName(file.name)
    const fileExt = sanitizedOriginalName.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename: sanitizedOriginalName,
        file_size: file.size,
        file_type: file.type,
        storage_path: uploadData.path,
        processing_status: 'pending',
      })
      .select()
      .single()

    if (docError) {
      console.error('Document creation error:', docError)
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
    }

    // Update user's document count
    await supabase
      .from('users')
      .update({ 
        documents_processed: user.documents_processed + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    return NextResponse.json({ 
      document,
      message: 'Document uploaded successfully'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
