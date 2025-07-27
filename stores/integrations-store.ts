import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { UserIntegration, IntegrationMapping, PushResult } from './types'
import { NotionDatabase } from '@/lib/integrations/notion'

interface DatabaseInfo {
  integrationId: string
  database: NotionDatabase | null
  loading: boolean
  error: string | null
}

interface IntegrationsState {
  // State
  userIntegrations: UserIntegration[]
  currentIntegration: UserIntegration | null
  mappings: IntegrationMapping[]
  pushHistory: PushResult[]
  databasesInfo: Record<string, DatabaseInfo>
  isLoading: boolean
  isConnecting: boolean
  isPushing: boolean
  error: string | null
  
  // Actions
  setUserIntegrations: (integrations: UserIntegration[]) => void
  setCurrentIntegration: (integration: UserIntegration | null) => void
  setMappings: (mappings: IntegrationMapping[]) => void
  setPushHistory: (history: PushResult[]) => void
  setDatabaseInfo: (integrationId: string, info: DatabaseInfo) => void
  setLoading: (loading: boolean) => void
  setConnecting: (connecting: boolean) => void
  setPushing: (pushing: boolean) => void
  setError: (error: string | null) => void
  
  // Async actions
  fetchUserIntegrations: () => Promise<void>
  connectIntegration: (type: string, config: Record<string, any>) => Promise<UserIntegration>
  disconnectIntegration: (integrationId: string) => Promise<void>
  updateIntegrationConfig: (integrationId: string, config: Record<string, any>) => Promise<void>
  testIntegrationConnection: (integrationId: string) => Promise<boolean>
  pushDataToIntegration: (integrationId: string, documentId: string, data: any) => Promise<PushResult>
  fetchMappings: (integrationId: string) => Promise<void>
  saveMappings: (integrationId: string, mappings: IntegrationMapping[]) => Promise<void>
  fetchPushHistory: (documentId?: string) => Promise<void>
  fetchDatabaseInfo: (integrationId: string) => Promise<void>
  
  // Utility actions
  clearError: () => void
  reset: () => void
}

export const useIntegrationsStore = create<IntegrationsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      userIntegrations: [],
      currentIntegration: null,
      mappings: [],
      pushHistory: [],
      databasesInfo: {},
      isLoading: false,
      isConnecting: false,
      isPushing: false,
      error: null,

      // Basic setters
      setUserIntegrations: (integrations) => 
        set({ userIntegrations: integrations }, false, 'setUserIntegrations'),
      
      setCurrentIntegration: (integration) => 
        set({ currentIntegration: integration }, false, 'setCurrentIntegration'),
      
      setMappings: (mappings) => 
        set({ mappings }, false, 'setMappings'),
      
      setPushHistory: (history) =>
        set({ pushHistory: history }, false, 'setPushHistory'),

      setDatabaseInfo: (integrationId, info) =>
        set((state) => ({
          databasesInfo: { ...state.databasesInfo, [integrationId]: info }
        }), false, 'setDatabaseInfo'),

      setLoading: (loading) =>
        set({ isLoading: loading }, false, 'setLoading'),
      
      setConnecting: (connecting) => 
        set({ isConnecting: connecting }, false, 'setConnecting'),
      
      setPushing: (pushing) => 
        set({ isPushing: pushing }, false, 'setPushing'),
      
      setError: (error) => 
        set({ error }, false, 'setError'),

      // Async actions
      fetchUserIntegrations: async () => {
        set({ isLoading: true, error: null }, false, 'fetchUserIntegrations:start')
        
        try {
          const response = await fetch('/api/integrations')
          if (!response.ok) {
            throw new Error('Failed to fetch integrations')
          }
          
          const integrations = await response.json()
          set({ 
            userIntegrations: integrations,
            isLoading: false 
          }, false, 'fetchUserIntegrations:success')
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch integrations',
            isLoading: false 
          }, false, 'fetchUserIntegrations:error')
        }
      },

      connectIntegration: async (type: string, config: Record<string, any>) => {
        set({ isConnecting: true, error: null }, false, 'connectIntegration:start')
        
        try {
          const response = await fetch('/api/integrations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, config }),
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            throw new Error(errorData.error || `Failed to connect integration (${response.status})`)
          }
          
          const integration = await response.json()
          
          set((state) => ({
            userIntegrations: [...state.userIntegrations, integration],
            isConnecting: false
          }), false, 'connectIntegration:success')
          
          return integration
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to connect integration',
            isConnecting: false 
          }, false, 'connectIntegration:error')
          throw error
        }
      },

      disconnectIntegration: async (integrationId: string) => {
        set({ isLoading: true, error: null }, false, 'disconnectIntegration:start')
        
        try {
          const response = await fetch(`/api/integrations/${integrationId}`, {
            method: 'DELETE',
          })
          
          if (!response.ok) {
            throw new Error('Failed to disconnect integration')
          }
          
          set((state) => ({
            userIntegrations: state.userIntegrations.filter(i => i.id !== integrationId),
            currentIntegration: state.currentIntegration?.id === integrationId ? null : state.currentIntegration,
            isLoading: false
          }), false, 'disconnectIntegration:success')
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to disconnect integration',
            isLoading: false 
          }, false, 'disconnectIntegration:error')
        }
      },

      updateIntegrationConfig: async (integrationId: string, updates: Record<string, any>) => {
        set({ isLoading: true, error: null }, false, 'updateIntegrationConfig:start')

        try {
          // Separate config from other fields
          const { integration_name, is_active, ...config } = updates

          const requestBody: any = {}
          if (Object.keys(config).length > 0) {
            requestBody.config = config
          }
          if (integration_name !== undefined) {
            requestBody.name = integration_name
          }
          if (is_active !== undefined) {
            requestBody.is_active = is_active
          }

          const response = await fetch(`/api/integrations/${integrationId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          })

          if (!response.ok) {
            throw new Error('Failed to update integration config')
          }
          
          const updatedIntegration = await response.json()
          
          set((state) => ({
            userIntegrations: state.userIntegrations.map(i => 
              i.id === integrationId ? updatedIntegration : i
            ),
            currentIntegration: state.currentIntegration?.id === integrationId ? updatedIntegration : state.currentIntegration,
            isLoading: false
          }), false, 'updateIntegrationConfig:success')
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update integration config',
            isLoading: false 
          }, false, 'updateIntegrationConfig:error')
        }
      },

      testIntegrationConnection: async (integrationId: string) => {
        set({ isLoading: true, error: null }, false, 'testIntegrationConnection:start')
        
        try {
          const response = await fetch(`/api/integrations/${integrationId}/test`, {
            method: 'POST',
          })
          
          if (!response.ok) {
            throw new Error('Connection test failed')
          }
          
          const result = await response.json()
          set({ isLoading: false }, false, 'testIntegrationConnection:success')
          
          return result.success
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Connection test failed',
            isLoading: false 
          }, false, 'testIntegrationConnection:error')
          return false
        }
      },

      pushDataToIntegration: async (integrationId: string, documentId: string, data: any) => {
        set({ isPushing: true, error: null }, false, 'pushDataToIntegration:start')
        
        try {
          const response = await fetch(`/api/integrations/${integrationId}/push`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ documentId, data }),
          })
          
          if (!response.ok) {
            throw new Error('Failed to push data')
          }
          
          const result = await response.json()
          
          set((state) => ({
            pushHistory: [result, ...state.pushHistory],
            isPushing: false
          }), false, 'pushDataToIntegration:success')
          
          return result
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to push data',
            isPushing: false 
          }, false, 'pushDataToIntegration:error')
          throw error
        }
      },

      fetchMappings: async (integrationId: string) => {
        set({ isLoading: true, error: null }, false, 'fetchMappings:start')
        
        try {
          const response = await fetch(`/api/integrations/${integrationId}/mappings`)
          if (!response.ok) {
            throw new Error('Failed to fetch mappings')
          }
          
          const mappings = await response.json()
          set({ 
            mappings,
            isLoading: false 
          }, false, 'fetchMappings:success')
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch mappings',
            isLoading: false 
          }, false, 'fetchMappings:error')
        }
      },

      saveMappings: async (integrationId: string, mappings: IntegrationMapping[]) => {
        set({ isLoading: true, error: null }, false, 'saveMappings:start')
        
        try {
          const response = await fetch(`/api/integrations/${integrationId}/mappings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mappings }),
          })
          
          if (!response.ok) {
            throw new Error('Failed to save mappings')
          }
          
          const savedMappings = await response.json()
          set({ 
            mappings: savedMappings,
            isLoading: false 
          }, false, 'saveMappings:success')
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to save mappings',
            isLoading: false 
          }, false, 'saveMappings:error')
        }
      },

      fetchPushHistory: async (documentId?: string) => {
        set({ isLoading: true, error: null }, false, 'fetchPushHistory:start')
        
        try {
          const url = documentId 
            ? `/api/integrations/push-history?documentId=${documentId}`
            : '/api/integrations/push-history'
          
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error('Failed to fetch push history')
          }
          
          const history = await response.json()
          set({ 
            pushHistory: history,
            isLoading: false 
          }, false, 'fetchPushHistory:success')
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch push history',
            isLoading: false 
          }, false, 'fetchPushHistory:error')
        }
      },

      fetchDatabaseInfo: async (integrationId: string) => {
        const { userIntegrations, setDatabaseInfo } = get()
        const integration = userIntegrations.find(i => i.id === integrationId)

        if (!integration || integration.integration_type !== 'notion') {
          return
        }

        // Set loading state
        setDatabaseInfo(integrationId, {
          integrationId,
          database: null,
          loading: true,
          error: null
        })

        try {
          const response = await fetch(
            `/api/integrations/notion/database/${integration.config.database_id}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                api_key: integration.config.api_key
              })
            }
          )

          if (!response.ok) {
            throw new Error(`Failed to fetch database: ${response.statusText}`)
          }

          const database = await response.json()

          setDatabaseInfo(integrationId, {
            integrationId,
            database,
            loading: false,
            error: null
          })
        } catch (error) {
          console.error(`Failed to fetch database info for ${integrationId}:`, error)
          setDatabaseInfo(integrationId, {
            integrationId,
            database: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch database'
          })
        }
      },

      // Utility actions
      clearError: () => set({ error: null }, false, 'clearError'),
      
      reset: () => set({
        userIntegrations: [],
        currentIntegration: null,
        mappings: [],
        pushHistory: [],
        databasesInfo: {},
        isLoading: false,
        isConnecting: false,
        isPushing: false,
        error: null
      }, false, 'reset')
    }),
    {
      name: 'integrations-store'
    }
  )
)

// Convenience hooks
export const useIntegrations = () => {
  const store = useIntegrationsStore()
  return {
    userIntegrations: store.userIntegrations,
    isLoading: store.isLoading,
    error: store.error,
    fetchUserIntegrations: store.fetchUserIntegrations,
    connectIntegration: store.connectIntegration,
    disconnectIntegration: store.disconnectIntegration,
    clearError: store.clearError
  }
}

export const useIntegrationPush = () => {
  const store = useIntegrationsStore()
  return {
    isPushing: store.isPushing,
    pushHistory: store.pushHistory,
    error: store.error,
    pushDataToIntegration: store.pushDataToIntegration,
    fetchPushHistory: store.fetchPushHistory,
    clearError: store.clearError
  }
}
