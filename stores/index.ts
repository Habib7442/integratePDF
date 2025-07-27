// Export all stores and types
export { useUserStore } from './user-store'
export { useDocumentsStore } from './documents-store'
export { useUIStore, useNotifications } from './ui-store'
export { useIntegrationsStore, useIntegrations, useIntegrationPush } from './integrations-store'

// Export types
export type {
  User,
  Document,
  ExtractedField,
  ExtractedData,
  DocumentStatus,
  Notification,
  LoadingState,
  ErrorState,
  Integration,
  IntegrationConfigField,
  UserIntegration,
  IntegrationMapping,
  PushResult
} from './types'

// Store selectors for better performance
export const userSelectors = {
  user: (state: any) => state.user,
  isAuthenticated: (state: any) => state.isAuthenticated,
  isLoading: (state: any) => state.isLoading,
  error: (state: any) => state.error
}

export const documentsSelectors = {
  documents: (state: any) => state.documents,
  currentDocument: (state: any) => state.currentDocument,
  extractedData: (state: any) => state.extractedData,
  isLoading: (state: any) => state.isLoading,
  isUploading: (state: any) => state.isUploading,
  error: (state: any) => state.error,
  processingDocuments: (state: any) => state.processingDocuments
}

export const uiSelectors = {
  notifications: (state: any) => state.notifications,
  globalLoading: (state: any) => state.globalLoading,
  showProcessingStatus: (state: any) => state.showProcessingStatus,
  processingDocumentId: (state: any) => state.processingDocumentId,
  isSidebarOpen: (state: any) => state.isSidebarOpen,
  theme: (state: any) => state.theme
}
