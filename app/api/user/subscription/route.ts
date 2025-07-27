import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for server-side operations to bypass RLS
const getSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier } = body

    if (!tier || !['free', 'pro', 'business'].includes(tier)) {
      return NextResponse.json({ 
        error: 'Invalid subscription tier' 
      }, { status: 400 })
    }

    const supabase = getSupabaseServiceClient()
    
    const monthlyLimits = {
      free: 10,
      pro: 500,
      business: 2500,
    }

    // Update user subscription
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        subscription_tier: tier,
        monthly_limit: monthlyLimits[tier as keyof typeof monthlyLimits],
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', clerkUserId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
