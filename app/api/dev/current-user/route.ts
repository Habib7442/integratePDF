import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

/**
 * Development endpoint to show current user information
 */
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userInfo = {
      clerkUserId: userId,
      email: user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      primaryEmailId: user.primaryEmailAddressId,
      allEmails: user.emailAddresses.map(e => ({
        id: e.id,
        email: e.emailAddress,
        isPrimary: e.id === user.primaryEmailAddressId
      }))
    }

    return NextResponse.json({
      message: 'Current user information',
      user: userInfo,
      sqlInsert: `
INSERT INTO users (
    clerk_user_id,
    email,
    first_name,
    last_name,
    avatar_url,
    subscription_tier,
    documents_processed,
    monthly_limit,
    created_at,
    updated_at
) VALUES (
    '${userId}',
    '${userInfo.email}',
    '${userInfo.firstName || 'User'}',
    '${userInfo.lastName || 'Name'}',
    ${userInfo.imageUrl ? `'${userInfo.imageUrl}'` : 'NULL'},
    'free',
    0,
    10,
    NOW(),
    NOW()
);`
    })

  } catch (error) {
    console.error('Error getting current user:', error)
    return NextResponse.json({ 
      error: 'Failed to get user info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
