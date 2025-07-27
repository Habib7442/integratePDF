import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Notification } from './types'

interface UIState {
  // Modals
  isUploadModalOpen: boolean
  isDeleteModalOpen: boolean
  isSettingsModalOpen: boolean
  
  // Notifications
  notifications: Notification[]
  
  // Loading states
  globalLoading: boolean
  
  // Processing status
  showProcessingStatus: boolean
  processingDocumentId: string | null
  
  // Sidebar
  isSidebarOpen: boolean
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Actions
  setUploadModalOpen: (open: boolean) => void
  setDeleteModalOpen: (open: boolean) => void
  setSettingsModalOpen: (open: boolean) => void
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void
  
  // Processing actions
  setShowProcessingStatus: (show: boolean) => void
  setProcessingDocumentId: (id: string | null) => void
  
  // Sidebar actions
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // Utility actions
  showSuccessNotification: (title: string, message: string) => void
  showErrorNotification: (title: string, message: string) => void
  showWarningNotification: (title: string, message: string) => void
  showInfoNotification: (title: string, message: string) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isUploadModalOpen: false,
      isDeleteModalOpen: false,
      isSettingsModalOpen: false,
      notifications: [],
      globalLoading: false,
      showProcessingStatus: false,
      processingDocumentId: null,
      isSidebarOpen: false,
      theme: 'system',

      // Modal actions
      setUploadModalOpen: (open) => 
        set({ isUploadModalOpen: open }, false, 'setUploadModalOpen'),
      
      setDeleteModalOpen: (open) => 
        set({ isDeleteModalOpen: open }, false, 'setDeleteModalOpen'),
      
      setSettingsModalOpen: (open) => 
        set({ isSettingsModalOpen: open }, false, 'setSettingsModalOpen'),

      // Notification actions
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        const timestamp = Date.now()
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp
        }
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }), false, 'addNotification')

        // Auto-remove notification after duration
        const duration = notification.duration || 5000
        setTimeout(() => {
          get().removeNotification(id)
        }, duration)
      },
      
      removeNotification: (id) => 
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }), false, 'removeNotification'),
      
      clearNotifications: () => 
        set({ notifications: [] }, false, 'clearNotifications'),

      // Loading actions
      setGlobalLoading: (loading) => 
        set({ globalLoading: loading }, false, 'setGlobalLoading'),

      // Processing actions
      setShowProcessingStatus: (show) => 
        set({ showProcessingStatus: show }, false, 'setShowProcessingStatus'),
      
      setProcessingDocumentId: (id) => 
        set({ processingDocumentId: id }, false, 'setProcessingDocumentId'),

      // Sidebar actions
      setSidebarOpen: (open) => 
        set({ isSidebarOpen: open }, false, 'setSidebarOpen'),
      
      toggleSidebar: () => 
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'toggleSidebar'),

      // Theme actions
      setTheme: (theme) => 
        set({ theme }, false, 'setTheme'),

      // Utility actions
      showSuccessNotification: (title, message) => {
        get().addNotification({
          type: 'success',
          title,
          message,
          duration: 4000
        })
      },
      
      showErrorNotification: (title, message) => {
        get().addNotification({
          type: 'error',
          title,
          message,
          duration: 6000
        })
      },
      
      showWarningNotification: (title, message) => {
        get().addNotification({
          type: 'warning',
          title,
          message,
          duration: 5000
        })
      },
      
      showInfoNotification: (title, message) => {
        get().addNotification({
          type: 'info',
          title,
          message,
          duration: 4000
        })
      }
    }),
    { name: 'UIStore' }
  )
)

// Convenience hooks
export const useNotifications = () => {
  const store = useUIStore()
  return {
    notifications: store.notifications,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    showSuccessNotification: store.showSuccessNotification,
    showErrorNotification: store.showErrorNotification,
    showWarningNotification: store.showWarningNotification,
    showInfoNotification: store.showInfoNotification
  }
}
