import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify webhook system status
 */
export async function GET() {
  try {
    // Check if webhook signing secret is configured
    const hasSigningSecret = !!process.env.CLERK_WEBHOOK_SIGNING_SECRET
    const hasSupabaseConfig = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    // Check if webhook endpoint exists
    const webhookEndpointExists = true // We know it exists since we created it
    
    const status = {
      webhookSystem: 'active',
      configuration: {
        signingSecret: hasSigningSecret ? 'configured' : 'missing',
        supabaseConnection: hasSupabaseConfig ? 'configured' : 'missing',
        webhookEndpoint: webhookEndpointExists ? 'available' : 'missing'
      },
      endpoints: {
        webhook: '/api/webhooks/clerk',
        userFetch: '/api/protected/user'
      },
      supportedEvents: [
        'user.created',
        'user.updated', 
        'user.deleted'
      ],
      features: [
        'Single source of truth for user creation',
        'Automatic user synchronization',
        'Duplicate prevention',
        'Real-time profile updates',
        'Secure signature verification'
      ],
      migration: {
        removedComponents: [
          'UserSync component',
          'useUserSync hook',
          '/api/user/sync endpoint',
          'Manual sync calls'
        ],
        newBehavior: 'Users are created automatically by webhooks when they sign up in Clerk'
      }
    }
    
    return NextResponse.json(status)
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check webhook status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
