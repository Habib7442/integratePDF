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

            // Create or update profile with retry logic
            let retryCount = 0
            const maxRetries = 3
            let lastError: Error | null = null

            while (retryCount < maxRetries) {
              try {
                const createResponse = await fetch('/api/user/profile', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ clerkUserId })
                })

                if (createResponse.ok) {
                  const userData = await createResponse.json()
                  setUser(userData)
                  setAuthenticated(true)
                  return // Success, exit the function
                }

                // Handle different error types
                const errorData = await createResponse.json().catch(() => ({ error: 'Unknown error' }))

                if (createResponse.status === 400) {
                  // Validation error - don't retry
                  throw new Error(`Validation error: ${errorData.error || 'Invalid user data'}`)
                } else if (createResponse.status === 401) {
                  // Authentication error - don't retry
                  throw new Error('Authentication failed. Please sign in again.')
                } else if (createResponse.status >= 500) {
                  // Server error - retry
                  lastError = new Error(`Server error: ${errorData.error || 'Internal server error'}`)
                  retryCount++

                  if (retryCount < maxRetries) {
                    console.warn(`User initialization attempt ${retryCount} failed, retrying...`)
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // Exponential backoff
                    continue
                  }
                } else {
                  // Other errors - don't retry
                  throw new Error(`HTTP ${createResponse.status}: ${errorData.error || 'Unknown error'}`)
                }

              } catch (fetchError) {
                if (fetchError instanceof Error && !fetchError.message.includes('Server error')) {
                  // Non-server errors shouldn't be retried
                  throw fetchError
                }
                lastError = fetchError as Error
                retryCount++

                if (retryCount < maxRetries) {
                  console.warn(`User initialization attempt ${retryCount} failed, retrying...`)
                  await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
                }
              }
            }

            // If we get here, all retries failed
            throw lastError || new Error('Failed to initialize user after multiple attempts')

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
