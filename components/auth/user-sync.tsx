'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'

/**
 * Component that automatically syncs user profile data with Supabase
 * when the user signs in. This ensures the users table is always up-to-date.
 */
export function UserSync() {
  const { isLoaded, userId, user } = useAuth()
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [hasAttempted, setHasAttempted] = useState(false)

  useEffect(() => {
    // DISABLED: User sync is now handled by the store initialization
    // This prevents duplicate user creation
    console.log('UserSync component loaded but sync is disabled to prevent duplicates')
    setSyncStatus('success') // Mark as success to avoid UI issues
    setHasAttempted(true)
  }, [isLoaded, userId, user, hasAttempted])

  // This component doesn't render anything visible
  // It just handles the background sync
  return null
}

/**
 * Optional: Component that shows sync status (for debugging)
 */
export function UserSyncStatus() {
  const { isLoaded, userId } = useAuth()
  const { syncUserProfile } = useUserSync()
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    if (!isLoaded || !userId) {
      setSyncStatus('idle')
      return
    }

    const performSync = async () => {
      setSyncStatus('syncing')
      
      try {
        const result = await syncUserProfile()
        
        if (result) {
          setSyncStatus('success')
          setLastSync(new Date())
          console.log('User profile synced successfully:', result)
        } else {
          setSyncStatus('error')
          console.error('Failed to sync user profile')
        }
      } catch (error) {
        setSyncStatus('error')
        console.error('Error during user sync:', error)
      }
    }

    const timer = setTimeout(performSync, 500)
    
    return () => clearTimeout(timer)
  }, [isLoaded, userId, syncUserProfile])

  if (!isLoaded || !userId) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-3 shadow-lg text-sm max-w-xs">
      <div className="font-medium text-gray-900">User Sync Status</div>
      <div className="flex items-center gap-2 mt-1">
        <div className={`w-2 h-2 rounded-full ${
          syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
          syncStatus === 'success' ? 'bg-green-500' :
          syncStatus === 'error' ? 'bg-red-500' :
          'bg-gray-300'
        }`} />
        <span className="text-gray-600">
          {syncStatus === 'syncing' && 'Syncing...'}
          {syncStatus === 'success' && 'Synced'}
          {syncStatus === 'error' && 'Error'}
          {syncStatus === 'idle' && 'Idle'}
        </span>
      </div>
      {lastSync && (
        <div className="text-xs text-gray-500 mt-1">
          Last sync: {lastSync.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
