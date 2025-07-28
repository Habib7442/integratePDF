#!/usr/bin/env node

/**
 * Test script to verify webhook functionality
 * Run with: node scripts/test-webhook.js
 */

const crypto = require('crypto')

// Test webhook payload (simulates Clerk user.created event)
const testPayload = {
  data: {
    id: 'user_test123',
    email_addresses: [
      {
        id: 'email_test123',
        email_address: 'test@example.com'
      }
    ],
    primary_email_address_id: 'email_test123',
    first_name: 'Test',
    last_name: 'User',
    image_url: null
  },
  type: 'user.created',
  object: 'event'
}

// Your webhook signing secret (from .env.local)
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET || 'whsec_l8gQbKz7KdFjAaBtkIjJ57ovfVk16BRh'

function generateWebhookSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000)
  const payloadString = JSON.stringify(payload)
  
  // Remove 'whsec_' prefix from secret
  const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64')
  
  // Create signature
  const signedPayload = `${timestamp}.${payloadString}`
  const signature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedPayload)
    .digest('base64')
  
  return {
    timestamp,
    signature: `v1,${signature}`,
    payload: payloadString
  }
}

async function testWebhook() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const webhookUrl = `${baseUrl}/api/webhooks/clerk`
  
  console.log('🧪 Testing webhook endpoint...')
  console.log(`📍 URL: ${webhookUrl}`)
  
  try {
    const { timestamp, signature, payload } = generateWebhookSignature(testPayload, WEBHOOK_SECRET)
    
    console.log('📝 Generated signature:', signature)
    console.log('⏰ Timestamp:', timestamp)
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': 'msg_test123',
        'svix-timestamp': timestamp.toString(),
        'svix-signature': signature
      },
      body: payload
    })
    
    const responseText = await response.text()
    
    console.log('\n📊 Response:')
    console.log(`Status: ${response.status} ${response.statusText}`)
    console.log(`Body: ${responseText}`)
    
    if (response.ok) {
      console.log('\n✅ Webhook test successful!')
    } else {
      console.log('\n❌ Webhook test failed!')
    }
    
  } catch (error) {
    console.error('\n💥 Error testing webhook:', error.message)
  }
}

// Check if running directly
if (require.main === module) {
  testWebhook()
}

module.exports = { testWebhook, generateWebhookSignature }
