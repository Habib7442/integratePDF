# Local Development Webhook Setup

## Problem
In localhost development, Clerk webhooks can't reach your local server, causing user synchronization to fail. This results in 500 errors during document extraction because users don't exist in the Supabase database.

## Solution: Use ngrok for Local Webhook Testing

### Step 1: Install ngrok
1. Go to [ngrok.com](https://ngrok.com) and create a free account
2. Download and install ngrok
3. Authenticate: `ngrok authtoken YOUR_AUTH_TOKEN`

### Step 2: Start your development server
```bash
npm run dev
```

### Step 3: Start ngrok tunnel
In a new terminal:
```bash
ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok.io`

### Step 4: Configure Clerk Webhook
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to your project → Webhooks
3. Create a new webhook with:
   - **Endpoint URL**: `https://abc123.ngrok.io/api/webhooks/clerk`
   - **Events**: Select `user.created`, `user.updated`, `user.deleted`
   - **Signing Secret**: Copy this to your `.env.local` as `CLERK_WEBHOOK_SIGNING_SECRET`

### Step 5: Test the webhook
1. Sign up a new user in your app
2. Check the ngrok terminal for webhook requests
3. Check your app logs for user creation messages

## Alternative Solution: Manual User Creation for Development

If you don't want to set up ngrok, you can manually create users in the database:

### Create a development endpoint
Add this to `app/api/dev/create-user/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = getSupabaseServiceClient()
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists', user: existingUser })
    }

    // Create user manually
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        clerk_user_id: userId,
        email: 'dev@example.com', // Replace with actual email if needed
        first_name: 'Dev',
        last_name: 'User',
        subscription_tier: 'free',
        documents_processed: 0,
        monthly_limit: 10,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'User created successfully', user: newUser })
  } catch (error) {
    console.error('Error creating dev user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
```

Then call this endpoint after signing in: `POST /api/dev/create-user`

## Recommended Approach
Use ngrok for the most accurate development experience that matches production behavior.
