'use client'

import { createClient } from '@supabase/supabase-js'
import { useAuth, useSession } from '@clerk/nextjs'
import { useMemo } from 'react'
import type { Database } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Custom hook that creates a Supabase client with Clerk authentication
 * This automatically handles JWT token refresh and user authentication
 */
export function useSupabaseClerk() {
  const { isLoaded, userId } = useAuth()
  const { session } = useSession()

  const supabase = useMemo(() => {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: async () => {
          if (!session) return {}
          
          try {
            const token = await session.getToken({ template: 'supabase' })
            return token ? { Authorization: `Bearer ${token}` } : {}
          } catch (error) {
            console.error('Error getting Clerk token:', error)
            return {}
          }
        },
      },
    })
  }, [session])

  return {
    supabase,
    isAuthenticated: isLoaded && !!userId,
    userId,
    isLoading: !isLoaded,
  }
}

/**
 * Hook to automatically sync user profile with Supabase
 * This ensures user data is created/updated when they sign in
 * Temporarily uses API route to bypass RLS issues
 */
export function useUserSync() {
  const { isAuthenticated, userId } = useSupabaseClerk()
  const { user } = useAuth()

  const syncUserProfile = async () => {
    if (!isAuthenticated || !userId || !user) {
      console.log('User sync skipped: not authenticated or missing data', {
        isAuthenticated,
        userId: !!userId,
        user: !!user
      })
      return null
    }

    try {
      console.log('Starting user sync via API for:', userId)

      const userData = {
        email: user.emailAddresses[0]?.emailAddress || '',
        first_name: user.firstName,
        last_name: user.lastName,
        avatar_url: user.imageUrl,
      }

      console.log('User data to sync:', userData)

      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API Error ${response.status}: ${errorData.error} - ${errorData.details || ''}`)
      }

      const result = await response.json()
      console.log('User sync successful:', result)

      return result.user
    } catch (error) {
      console.error('Error syncing user profile:', error)
      throw error // Re-throw to see the full error in the component
    }
  }

  return {
    syncUserProfile,
    isAuthenticated,
    userId,
  }
}
