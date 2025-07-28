import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { User } from './types'

interface UserState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateUser: (updates: Partial<User>) => void
  clearUser: () => void
  
  // Async actions
  initializeUser: (clerkUserId: string) => Promise<void>
  updateSubscription: (tier: 'free' | 'pro' | 'business') => Promise<void>
  incrementDocumentsProcessed: () => void
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        setUser: (user) => set({ user }, false, 'setUser'),
        
        setAuthenticated: (authenticated) => 
          set({ isAuthenticated: authenticated }, false, 'setAuthenticated'),
        
        setLoading: (loading) => 
          set({ isLoading: loading }, false, 'setLoading'),
        
        setError: (error) => 
          set({ error }, false, 'setError'),
        
        updateUser: (updates) => 
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null
          }), false, 'updateUser'),
        
        clearUser: () => 
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null 
          }, false, 'clearUser'),

        // Async actions
        initializeUser: async (clerkUserId: string) => {
          const { setLoading, setError, setUser, setAuthenticated } = get()

          try {
            setLoading(true)
            setError(null)

            console.log('Initializing user from webhook-created data:', clerkUserId)

            // Fetch user data that should already exist (created by webhook)
            let retryCount = 0
            const maxRetries = 5 // Increased retries to allow time for webhook processing
            let lastError: Error | null = null

            while (retryCount < maxRetries) {
              try {
                const response = await fetch('/api/protected/user', {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json' }
                })

                if (response.ok) {
                  const result = await response.json()
                  const userData = result.user || result
                  setUser(userData)
                  setAuthenticated(true)
                  console.log('User initialized successfully from webhook data:', userData.email)
                  return // Success, exit the function
                }

                // Handle different error types
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))

                if (response.status === 404) {
                  // User not found - webhook might still be processing
                  if (retryCount < maxRetries - 1) {
                    console.log(`User not found (attempt ${retryCount + 1}), webhook may still be processing...`)
                    lastError = new Error('User profile is being created. Please wait a moment.')
                    retryCount++
                    await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1))) // Longer wait for webhook
                    continue
                  } else {
                    throw new Error('User profile not found. Please try signing out and signing in again.')
                  }
                } else if (response.status === 401) {
                  // Authentication error - don't retry
                  throw new Error('Authentication failed. Please sign in again.')
                } else if (response.status >= 500) {
                  // Server error - retry
                  lastError = new Error(`Server error: ${errorData.error || 'Internal server error'}`)
                  retryCount++

                  if (retryCount < maxRetries) {
                    console.warn(`User fetch attempt ${retryCount} failed, retrying...`)
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
                    continue
                  }
                } else {
                  // Other errors - don't retry
                  throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`)
                }

              } catch (fetchError) {
                if (fetchError instanceof Error && !fetchError.message.includes('Server error')) {
                  // Non-server errors shouldn't be retried
                  throw fetchError
                }
                lastError = fetchError as Error
                retryCount++

                if (retryCount < maxRetries) {
                  console.warn(`User fetch attempt ${retryCount} failed, retrying...`)
                  await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
                }
              }
            }

            // If we get here, all retries failed
            throw lastError || new Error('Failed to load user profile after multiple attempts. The user account may still be being created.')

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to initialize user'
            setError(errorMessage)
            console.error('User initialization error:', error)
          } finally {
            setLoading(false)
          }
        },

        updateSubscription: async (tier: 'free' | 'pro' | 'business') => {
          const { setLoading, setError, updateUser } = get()
          
          try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/user/subscription', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tier })
            })

            if (!response.ok) {
              throw new Error('Failed to update subscription')
            }

            const updatedUser = await response.json()
            updateUser(updatedUser)

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update subscription'
            setError(errorMessage)
            console.error('Subscription update error:', error)
          } finally {
            setLoading(false)
          }
        },

        incrementDocumentsProcessed: () => {
          const { user, updateUser } = get()
          if (user) {
            updateUser({ 
              documents_processed: user.documents_processed + 1 
            })
          }
        }
      }),
      {
        name: 'user-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    { name: 'UserStore' }
  )
)
