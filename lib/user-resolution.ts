import { createClient } from '@supabase/supabase-js'
import { clerkClient } from '@clerk/nextjs/server'

// Use service role for server-side operations to bypass RLS
const getSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

/**
 * Resolves a Clerk user ID to the corresponding database user UUID
 * Creates the user if they don't exist (handles race condition with webhooks)
 * @param clerkUserId - The Clerk user ID (e.g., "user_30PiGAatm1TUQHhzOj1cvzo80lh")
 * @param createIfNotExists - Whether to create the user if they don't exist (default: true)
 * @returns Promise<string> - The database user UUID
 * @throws Error if user not found and createIfNotExists is false
 */
export async function resolveClerkUserToDbUser(clerkUserId: string, createIfNotExists: boolean = true): Promise<string> {
  const supabase = getSupabaseServiceClient()

  // First, try to find the existing user
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single()

  // If user exists, return their ID
  if (userData && !userError) {
    return userData.id
  }

  // If user doesn't exist and we shouldn't create them, throw error
  if (!createIfNotExists) {
    throw new Error(`User not found for Clerk ID: ${clerkUserId}. Error: ${userError?.message || 'Unknown error'}`)
  }

  // User doesn't exist, create them (handles race condition with webhook)
  console.log(`Creating missing user for Clerk ID: ${clerkUserId}`)

  try {
    // Try to get user data from Clerk to populate fields
    let clerkUserData = null
    try {
      clerkUserData = await clerkClient.users.getUser(clerkUserId)
    } catch (clerkError) {
      console.warn(`Could not fetch Clerk user data for ${clerkUserId}:`, clerkError)
    }

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        clerk_user_id: clerkUserId,
        email: clerkUserData?.emailAddresses?.[0]?.emailAddress || '',
        first_name: clerkUserData?.firstName || null,
        last_name: clerkUserData?.lastName || null,
        avatar_url: clerkUserData?.imageUrl || null,
        subscription_tier: 'free',
        documents_processed: 0,
        monthly_limit: 10,
      })
      .select('id')
      .single()

    if (createError) {
      // Check if it's a unique constraint violation (user was created by webhook in the meantime)
      if (createError.code === '23505') {
        console.log(`User was created by webhook during race condition for Clerk ID: ${clerkUserId}`)
        // Try to fetch the user again
        const { data: retryUserData, error: retryError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_user_id', clerkUserId)
          .single()

        if (retryUserData && !retryError) {
          return retryUserData.id
        }
      }

      throw new Error(`Failed to create user for Clerk ID: ${clerkUserId}. Error: ${createError.message}`)
    }

    if (!newUser) {
      throw new Error(`Failed to create user for Clerk ID: ${clerkUserId}. No data returned`)
    }

    console.log(`Successfully created user for Clerk ID: ${clerkUserId}`)
    return newUser.id

  } catch (error) {
    console.error(`Error in resolveClerkUserToDbUser for ${clerkUserId}:`, error)
    throw error
  }
}

/**
 * Resolves a Clerk user ID to database user with retry logic
 * This is the recommended function to use for user resolution
 * @param clerkUserId - The Clerk user ID
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param retryDelay - Delay between retries in milliseconds (default: 1000)
 * @returns Promise<string> - The database user UUID
 */
export async function resolveClerkUserWithRetry(
  clerkUserId: string,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await resolveClerkUserToDbUser(clerkUserId, true)
    } catch (error) {
      lastError = error as Error
      console.warn(`User resolution attempt ${attempt}/${maxRetries} failed for ${clerkUserId}:`, error)

      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }

  throw new Error(`Failed to resolve user after ${maxRetries} attempts: ${lastError?.message}`)
}

/**
 * Verifies that a document belongs to a specific user
 * @param documentId - The document UUID
 * @param clerkUserId - The Clerk user ID
 * @returns Promise<{document: any, dbUserId: string}> - The document data and database user ID
 * @throws Error if document not found or doesn't belong to user
 */
export async function verifyDocumentOwnership(documentId: string, clerkUserId: string) {
  const supabase = getSupabaseServiceClient()
  
  // First resolve the user with retry logic
  const dbUserId = await resolveClerkUserWithRetry(clerkUserId)
  
  // Then verify document ownership
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', dbUserId)
    .single()

  if (docError || !document) {
    throw new Error(`Document not found or access denied. Document ID: ${documentId}, User: ${clerkUserId}`)
  }

  return { document, dbUserId }
}

/**
 * Gets extracted data for a document with ownership verification
 * @param documentId - The document UUID
 * @param clerkUserId - The Clerk user ID
 * @returns Promise<any[]> - Array of extracted data records
 */
export async function getExtractedDataWithOwnership(documentId: string, clerkUserId: string) {
  const supabase = getSupabaseServiceClient()
  
  // Verify ownership first
  const { dbUserId } = await verifyDocumentOwnership(documentId, clerkUserId)
  
  // Get extracted data
  const { data: extractedData, error: extractError } = await supabase
    .from('extracted_data')
    .select('*')
    .eq('document_id', documentId)
    .eq('user_id', dbUserId)
    .order('created_at', { ascending: true })

  if (extractError) {
    throw new Error(`Failed to fetch extracted data: ${extractError.message}`)
  }

  return extractedData || []
}

/**
 * Updates an extracted data field with ownership verification
 * @param fieldId - The extracted data field UUID
 * @param documentId - The document UUID
 * @param clerkUserId - The Clerk user ID
 * @param fieldValue - The new field value
 * @param isCorrected - Whether this is a manual correction
 * @returns Promise<any> - The updated field data
 */
export async function updateExtractedFieldWithOwnership(
  fieldId: string,
  documentId: string,
  clerkUserId: string,
  fieldValue: string,
  isCorrected: boolean = true
) {
  const supabase = getSupabaseServiceClient()
  
  // Verify ownership first
  const { dbUserId } = await verifyDocumentOwnership(documentId, clerkUserId)
  
  // Update the field
  const { data: updatedField, error: updateError } = await supabase
    .from('extracted_data')
    .update({
      field_value: fieldValue,
      is_corrected: isCorrected,
      updated_at: new Date().toISOString()
    })
    .eq('id', fieldId)
    .eq('document_id', documentId)
    .eq('user_id', dbUserId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to update field: ${updateError.message}`)
  }

  if (!updatedField) {
    throw new Error('Field not found or access denied')
  }

  return updatedField
}
