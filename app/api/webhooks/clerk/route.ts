import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { getSupabaseServiceClient } from '@/lib/supabase'
import type { WebhookEvent } from '@clerk/nextjs/webhooks'

/**
 * Clerk webhook endpoint for user synchronization
 * Handles user.created and user.updated events to sync user data to Supabase
 * This is the single source of truth for user creation and updates
 */
export async function POST(req: NextRequest) {
  try {
    console.log('🔗 Clerk webhook received')
    
    // Verify the webhook signature
    const evt = await verifyWebhook(req)
    
    const { id: eventId, type: eventType } = evt
    console.log(`📨 Webhook event: ${eventType} (ID: ${eventId})`)

    // Handle user.created event
    if (evt.type === 'user.created') {
      console.log('👤 Processing user.created event')
      await handleUserCreated(evt)
      return NextResponse.json({ message: 'User created successfully' }, { status: 200 })
    }

    // Handle user.updated event
    if (evt.type === 'user.updated') {
      console.log('✏️ Processing user.updated event')
      await handleUserUpdated(evt)
      return NextResponse.json({ message: 'User updated successfully' }, { status: 200 })
    }

    // Handle user.deleted event
    if (evt.type === 'user.deleted') {
      console.log('🗑️ Processing user.deleted event')
      await handleUserDeleted(evt)
      return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })
    }

    // Log unhandled events
    console.log(`⚠️ Unhandled webhook event type: ${eventType}`)
    return NextResponse.json({ message: 'Event type not handled' }, { status: 200 })

  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}

/**
 * Handle user.created webhook event
 * Creates a new user record in Supabase with data from Clerk
 */
async function handleUserCreated(evt: Extract<WebhookEvent, { type: 'user.created' }>) {
  const { id: clerkUserId, email_addresses, first_name, last_name, image_url } = evt.data

  console.log(`Creating user for Clerk ID: ${clerkUserId}`)

  const supabase = getSupabaseServiceClient()

  // Extract primary email
  const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id)
  const email = primaryEmail?.email_address || ''

  if (!email) {
    console.error('❌ No email found for user:', clerkUserId)
    throw new Error('User must have an email address')
  }

  // Check if user already exists (prevent duplicates)
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id, email')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('❌ Error checking for existing user:', checkError)
    throw new Error('Database error while checking for existing user')
  }

  if (existingUser) {
    console.log(`✅ User already exists: ${existingUser.email}`)
    return existingUser
  }

  // Create new user record
  const userData = {
    clerk_user_id: clerkUserId,
    email,
    first_name: first_name || null,
    last_name: last_name || null,
    avatar_url: image_url || null,
    subscription_tier: 'free' as const,
    documents_processed: 0,
    monthly_limit: 10,
  }

  console.log('📝 Creating user with data:', {
    clerk_user_id: clerkUserId,
    email,
    first_name: first_name || null,
    last_name: last_name || null,
    has_avatar: !!image_url
  })

  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()

  if (createError) {
    console.error('❌ Error creating user:', createError)
    throw new Error(`Failed to create user: ${createError.message}`)
  }

  console.log(`✅ User created successfully: ${newUser.email} (ID: ${newUser.id})`)
  return newUser
}

/**
 * Handle user.updated webhook event
 * Updates existing user record in Supabase with latest data from Clerk
 */
async function handleUserUpdated(evt: Extract<WebhookEvent, { type: 'user.updated' }>) {
  const { id: clerkUserId, email_addresses, first_name, last_name, image_url } = evt.data

  console.log(`Updating user for Clerk ID: ${clerkUserId}`)

  const supabase = getSupabaseServiceClient()

  // Extract primary email
  const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id)
  const email = primaryEmail?.email_address || ''

  // Update user data
  const updateData = {
    email,
    first_name: first_name || null,
    last_name: last_name || null,
    avatar_url: image_url || null,
    updated_at: new Date().toISOString(),
  }

  console.log('📝 Updating user with data:', {
    clerk_user_id: clerkUserId,
    email,
    first_name: first_name || null,
    last_name: last_name || null,
    has_avatar: !!image_url
  })

  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update(updateData)
    .eq('clerk_user_id', clerkUserId)
    .select()
    .single()

  if (updateError) {
    console.error('❌ Error updating user:', updateError)
    throw new Error(`Failed to update user: ${updateError.message}`)
  }

  console.log(`✅ User updated successfully: ${updatedUser.email} (ID: ${updatedUser.id})`)
  return updatedUser
}

/**
 * Handle user.deleted webhook event
 * Soft deletes user record in Supabase or removes it entirely
 */
async function handleUserDeleted(evt: Extract<WebhookEvent, { type: 'user.deleted' }>) {
  const { id: clerkUserId } = evt.data

  console.log(`Deleting user for Clerk ID: ${clerkUserId}`)

  const supabase = getSupabaseServiceClient()

  // For now, we'll hard delete the user
  // In production, you might want to soft delete or anonymize the data
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('clerk_user_id', clerkUserId)

  if (deleteError) {
    console.error('❌ Error deleting user:', deleteError)
    throw new Error(`Failed to delete user: ${deleteError.message}`)
  }

  console.log(`✅ User deleted successfully for Clerk ID: ${clerkUserId}`)
}
