import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { supabase } from '@/lib/supabase'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

if (!webhookSecret) {
  throw new Error('Please add CLERK_WEBHOOK_SECRET to your environment variables')
}

type ClerkWebhookEvent = {
  type: string
  data: {
    id: string
    email_addresses: Array<{
      email_address: string
      id: string
    }>
    first_name: string | null
    last_name: string | null
    image_url: string
    created_at: number
    updated_at: number
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
    }

    // Get the body
    const payload = await request.text()

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(webhookSecret)

    let evt: ClerkWebhookEvent

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkWebhookEvent
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the webhook
    const { type, data } = evt

    switch (type) {
      case 'user.created':
        await handleUserCreated(data)
        break
      case 'user.updated':
        await handleUserUpdated(data)
        break
      case 'user.deleted':
        await handleUserDeleted(data)
        break
      default:
        // Unhandled webhook type - no action needed
    }

    return NextResponse.json({ message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleUserCreated(data: ClerkWebhookEvent['data']) {
  try {
    // Check if user already exists to prevent duplicates
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', data.id)
      .single()

    if (existingUser) {
      console.log(`User already exists for Clerk ID: ${data.id}`)
      return
    }

    const { error } = await supabase
      .from('users')
      .insert({
        clerk_user_id: data.id,
        email: data.email_addresses[0]?.email_address || '',
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_url: data.image_url,
        subscription_tier: 'free',
        documents_processed: 0,
        monthly_limit: 10,
      })

    if (error) {
      // If it's a unique constraint violation, that's okay (race condition)
      if (error.code === '23505') {
        console.log(`User was already created during race condition for Clerk ID: ${data.id}`)
      } else {
        console.error('Error creating user in Supabase:', error)
      }
    } else {
      console.log(`Successfully created user via webhook for Clerk ID: ${data.id}`)
    }
  } catch (error) {
    console.error('Error in handleUserCreated:', error)
  }
}

async function handleUserUpdated(data: ClerkWebhookEvent['data']) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        email: data.email_addresses[0]?.email_address || '',
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_url: data.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', data.id)

    if (error) {
      console.error('Error updating user in Supabase:', error)
    }
  } catch (error) {
    console.error('Error in handleUserUpdated:', error)
  }
}

async function handleUserDeleted(data: ClerkWebhookEvent['data']) {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('clerk_user_id', data.id)

    if (error) {
      console.error('Error deleting user from Supabase:', error)
    }
  } catch (error) {
    console.error('Error in handleUserDeleted:', error)
  }
}
