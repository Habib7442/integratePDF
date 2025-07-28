'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface UserInitializationGuardProps {
  children: React.ReactNode
  onInitialized?: () => void
  onError?: (error: string) => void
}

export default function UserInitializationGuard({
  children,
  onInitialized,
  onError
}: UserInitializationGuardProps) {
  const { user, isLoaded } = useUser()
  const [initStatus, setInitStatus] = useState<'checking' | 'initializing' | 'ready' | 'error'>('checking')
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const checkUserInitialization = async () => {
    if (!user?.id) return

    try {
      setInitStatus('checking')
      setError(null)

      // Check if user exists in our database
      const response = await fetch('/api/protected/user')
      
      if (response.ok) {
        // User exists and is properly initialized
        setInitStatus('ready')
        if (onInitialized) {
          onInitialized()
        }
      } else if (response.status === 404) {
        // User not found, need to initialize
        setInitStatus('initializing')
        
        // Call user sync to create the user
        const syncResponse = await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })

        if (syncResponse.ok) {
          // Wait a moment for the user to be fully created
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Verify user was created
          const verifyResponse = await fetch('/api/protected/user')
          if (verifyResponse.ok) {
            setInitStatus('ready')
            if (onInitialized) {
              onInitialized()
            }
          } else {
            throw new Error('User verification failed after creation')
          }
        } else {
          const syncError = await syncResponse.json()
          throw new Error(syncError.error || 'Failed to initialize user account')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check user status')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setInitStatus('error')
      
      if (onError) {
        onError(errorMessage)
      }
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    checkUserInitialization()
  }

  useEffect(() => {
    if (isLoaded && user?.id) {
      checkUserInitialization()
    }
  }, [isLoaded, user?.id])

  // Show loading state while checking
  if (!isLoaded || initStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <motion.div
          className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg border border-slate-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-slate-700 font-medium">Checking account status...</span>
        </motion.div>
      </div>
    )
  }

  // Show initialization in progress
  if (initStatus === 'initializing') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <motion.div
          className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Setting Up Your Account</h3>
          <p className="text-slate-600 mb-4">
            We're initializing your account for the first time. This will only take a moment.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
            <span>Please wait...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show error state
  if (initStatus === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <motion.div
          className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Account Setup Issue</h3>
          <p className="text-slate-600 mb-4">
            {error || 'There was an issue setting up your account. Please try again.'}
          </p>
          <Button
            onClick={handleRetry}
            className="flex items-center gap-2"
            disabled={retryCount >= 3}
          >
            <RefreshCw className="h-4 w-4" />
            {retryCount >= 3 ? 'Please refresh the page' : 'Try Again'}
          </Button>
          {retryCount >= 3 && (
            <p className="text-xs text-slate-500 mt-2">
              If this issue persists, please contact support.
            </p>
          )}
        </motion.div>
      </div>
    )
  }

  // User is ready, show children
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
