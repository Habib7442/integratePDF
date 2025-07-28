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
    // DISABLED: User sync is now handled by the store initialization only
    // This prevents duplicate user creation
    console.log('useUserSync hook called but sync is disabled to prevent duplicates')
    return null
    }
  }

  return {
    syncUserProfile,
    isAuthenticated,
    userId,
  }
}
