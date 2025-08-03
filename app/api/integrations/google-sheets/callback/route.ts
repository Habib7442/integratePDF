import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseServiceClient } from '@/lib/supabase'
import { encryptApiKey } from '@/lib/encryption'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-sheets/callback`
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/dashboard?error=google_oauth_error&message=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=missing_oauth_params', request.url)
      )
    }

    // Verify state parameter
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
      if (stateData.userId !== userId) {
        throw new Error('Invalid state parameter')
      }
      
      // Check if state is not too old (5 minutes)
      if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
        throw new Error('State parameter expired')
      }
    } catch (error) {
      console.error('Invalid state parameter:', error)
      return NextResponse.redirect(
        new URL('/dashboard?error=invalid_state', request.url)
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL('/dashboard?error=token_exchange_failed', request.url)
      )
    }

    const tokens = await tokenResponse.json()

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info from Google')
      return NextResponse.redirect(
        new URL('/dashboard?error=user_info_failed', request.url)
      )
    }

    const userInfo = await userInfoResponse.json()

    // Store the integration in Supabase
    const supabase = getSupabaseServiceClient()

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (userError || !user) {
      console.error('User not found:', userError)
      return NextResponse.redirect(
        new URL('/dashboard?error=user_not_found', request.url)
      )
    }

    // Encrypt sensitive tokens
    const encryptedAccessToken = encryptApiKey(tokens.access_token)
    const encryptedRefreshToken = tokens.refresh_token ? encryptApiKey(tokens.refresh_token) : null
    const encryptedClientSecret = encryptApiKey(GOOGLE_CLIENT_SECRET!)

    // Create integration config
    const config = {
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: encryptedClientSecret,
      user_email: userInfo.email,
      user_name: userInfo.name,
      expires_at: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : null,
      scope: tokens.scope || GOOGLE_SCOPES
    }

    // Always create a new integration (support multiple Google Sheets connections)
    // Generate a unique name to distinguish multiple connections
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const integrationName = `Google Sheets - ${date} ${time}`

    const { error: insertError } = await supabase
      .from('integrations')
      .insert({
        user_id: user.id,
        integration_type: 'google_sheets',
        integration_name: integrationName,
        config,
        is_active: true,
        last_sync: new Date().toISOString()
      })

    if (insertError) {
      console.error('Failed to create Google Sheets integration:', insertError)
      return NextResponse.redirect(
        new URL('/dashboard?error=integration_creation_failed', request.url)
      )
    }

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard?success=google_sheets_connected', request.url)
    )
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=oauth_callback_failed', request.url)
    )
  }
}
