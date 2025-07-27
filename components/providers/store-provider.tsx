'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useUserStore, useDocumentsStore, useUIStore, useIntegrations } from '@/stores'

interface StoreProviderProps {
  children: React.ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { user, isLoaded } = useUser()
  const { initializeUser, setAuthenticated, clearUser } = useUserStore()
  const { showErrorNotification } = useUIStore()

  // Initialize user when Clerk user is loaded
  useEffect(() => {
    if (!isLoaded) return

    if (user && user.id) {
      // Validate user ID before initialization
      if (typeof user.id !== 'string' || !user.id.startsWith('user_')) {
        console.error('Invalid Clerk user ID format:', user.id)
        showErrorNotification(
          'Authentication Error',
          'Invalid user session. Please sign out and sign in again.'
        )
        return
      }

      // User is authenticated, initialize store
      initializeUser(user.id).catch((error) => {
        console.error('Failed to initialize user:', error)

        // Provide more specific error messages
        let errorMessage = 'Failed to load user profile. Please try refreshing the page.'
        if (error instanceof Error) {
          if (error.message.includes('Authentication failed')) {
            errorMessage = 'Authentication expired. Please sign in again.'
          } else if (error.message.includes('Validation error')) {
            errorMessage = 'User profile validation failed. Please contact support.'
          } else if (error.message.includes('Server error')) {
            errorMessage = 'Server temporarily unavailable. Please try again in a moment.'
          }
        }

        showErrorNotification('Authentication Error', errorMessage)
      })
    } else {
      // User is not authenticated, clear store
      clearUser()
      setAuthenticated(false)
    }
  }, [user, isLoaded, initializeUser, clearUser, setAuthenticated, showErrorNotification])

  return <>{children}</>
}

// Custom hooks for easier store access
export function useAuth() {
  const user = useUserStore((state) => state.user)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const isLoading = useUserStore((state) => state.isLoading)
  const error = useUserStore((state) => state.error)
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error
  }
}

export function useDocuments() {
  const documents = useDocumentsStore((state) => state.documents)
  const currentDocument = useDocumentsStore((state) => state.currentDocument)
  const extractedData = useDocumentsStore((state) => state.extractedData)
  const isLoading = useDocumentsStore((state) => state.isLoading)
  const isUploading = useDocumentsStore((state) => state.isUploading)
  const error = useDocumentsStore((state) => state.error)
  
  // Actions
  const fetchDocuments = useDocumentsStore((state) => state.fetchDocuments)
  const fetchDocument = useDocumentsStore((state) => state.fetchDocument)
  const uploadDocument = useDocumentsStore((state) => state.uploadDocument)
  const deleteDocument = useDocumentsStore((state) => state.deleteDocument)
  const deleteMultipleDocuments = useDocumentsStore((state) => state.deleteMultipleDocuments)
  const fetchExtractedData = useDocumentsStore((state) => state.fetchExtractedData)
  const updateExtractedField = useDocumentsStore((state) => state.updateExtractedField)
  const startExtraction = useDocumentsStore((state) => state.startExtraction)
  
  return {
    documents,
    currentDocument,
    extractedData,
    isLoading,
    isUploading,
    error,
    fetchDocuments,
    fetchDocument,
    uploadDocument,
    deleteDocument,
    deleteMultipleDocuments,
    fetchExtractedData,
    updateExtractedField,
    startExtraction
  }
}

export function useNotifications() {
  const notifications = useUIStore((state) => state.notifications)
  const addNotification = useUIStore((state) => state.addNotification)
  const removeNotification = useUIStore((state) => state.removeNotification)
  const clearNotifications = useUIStore((state) => state.clearNotifications)
  const showSuccessNotification = useUIStore((state) => state.showSuccessNotification)
  const showErrorNotification = useUIStore((state) => state.showErrorNotification)
  const showWarningNotification = useUIStore((state) => state.showWarningNotification)
  const showInfoNotification = useUIStore((state) => state.showInfoNotification)
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification
  }
}

export { useIntegrations } from '@/stores'

export function useUI() {
  const globalLoading = useUIStore((state) => state.globalLoading)
  const showProcessingStatus = useUIStore((state) => state.showProcessingStatus)
  const processingDocumentId = useUIStore((state) => state.processingDocumentId)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const theme = useUIStore((state) => state.theme)
  
  // Actions
  const setGlobalLoading = useUIStore((state) => state.setGlobalLoading)
  const setShowProcessingStatus = useUIStore((state) => state.setShowProcessingStatus)
  const setProcessingDocumentId = useUIStore((state) => state.setProcessingDocumentId)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const setTheme = useUIStore((state) => state.setTheme)
  
  return {
    globalLoading,
    showProcessingStatus,
    processingDocumentId,
    isSidebarOpen,
    theme,
    setGlobalLoading,
    setShowProcessingStatus,
    setProcessingDocumentId,
    setSidebarOpen,
    toggleSidebar,
    setTheme
  }
}
