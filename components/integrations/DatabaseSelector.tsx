'use client'

import React, { useEffect, useMemo, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Database, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { UserIntegration } from '@/stores/types'
import { NotionDatabase } from '@/lib/integrations/notion'
import { useIntegrationsStore } from '@/stores'

interface DatabaseSelectorProps {
  selectedIntegrationId?: string
  onSelect: (integrationId: string) => void
  disabled?: boolean
  className?: string
}

interface DatabaseInfo {
  integrationId: string
  database: NotionDatabase | null
  loading: boolean
  error: string | null
}

const DatabaseSelector: React.FC<DatabaseSelectorProps> = ({
  selectedIntegrationId,
  onSelect,
  disabled = false,
  className = ''
}) => {
  // Use Zustand store for integrations
  const {
    userIntegrations,
    isLoading: integrationsLoading,
    fetchUserIntegrations,
    databasesInfo,
    fetchDatabaseInfo
  } = useIntegrationsStore()

  // Fetch integrations on mount if not already loaded
  useEffect(() => {
    if (userIntegrations.length === 0 && !integrationsLoading) {
      fetchUserIntegrations()
    }
  }, [userIntegrations.length, integrationsLoading, fetchUserIntegrations])

  // Filter for active integrations that support data pushing - memoized to prevent recreation
  const availableDatabases = useMemo(() =>
    userIntegrations.filter(
      integration =>
        (integration.integration_type === 'notion' || integration.integration_type === 'google_sheets') &&
        integration.is_active
    ), [userIntegrations]
  )

  // Check if we're still loading database info
  const isInitialLoading = useMemo(() => {
    // If integrations are loading, show loading state
    if (integrationsLoading) return true

    // If no databases available, not loading
    if (availableDatabases.length === 0) return false

    // Check if any database info is still loading
    return availableDatabases.some(db => {
      const info = databasesInfo[db.id]
      return !info || info.loading
    })
  }, [integrationsLoading, availableDatabases, databasesInfo])

  // Fetch database information for all integrations
  useEffect(() => {
    if (availableDatabases.length === 0) return

    // Check which databases need info fetched
    const databasesToFetch = availableDatabases.filter(integration => {
      const info = databasesInfo[integration.id]
      return !info || info.error
    })

    // Fetch database info for each integration that needs it
    databasesToFetch.forEach(integration => {
      fetchDatabaseInfo(integration.id)
    })
  }, [availableDatabases, databasesInfo, fetchDatabaseInfo])

  const formatDatabaseId = (id: string) => {
    return id.length > 20 ? `${id.substring(0, 8)}...${id.substring(id.length - 8)}` : id
  }

  const getStatusIcon = (integration: UserIntegration) => {
    if (integration.is_active) {
      return <CheckCircle className="h-3 w-3 text-green-500" />
    }
    return <XCircle className="h-3 w-3 text-red-500" />
  }

  const getDatabaseDisplayInfo = useCallback((integration: UserIntegration) => {
    const info = databasesInfo[integration.id]

    if (!info) {
      // Handle different integration types
      if (integration.integration_type === 'google_sheets') {
        return {
          title: integration.integration_name,
          subtitle: integration.config.sheet_name ?
            `Sheet: ${integration.config.sheet_name}` :
            `Spreadsheet: ${formatDatabaseId(integration.config.spreadsheet_id || 'Unknown')}`,
          loading: false,
          error: null,
          icon: <Database className="h-4 w-4 text-green-600" />
        }
      } else {
        return {
          title: integration.integration_name,
          subtitle: `ID: ${formatDatabaseId(integration.config.database_id)}`,
          loading: false,
          error: null,
          icon: <Database className="h-4 w-4 text-gray-500" />
        }
      }
    }

    if (info.loading) {
      return {
        title: integration.integration_name,
        subtitle: 'Loading database info...',
        loading: true,
        error: null,
        icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      }
    }

    if (info.error) {
      return {
        title: integration.integration_name,
        subtitle: `Error: ${info.error}`,
        loading: false,
        error: info.error,
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />
      }
    }

    if (info.database) {
      if (integration.integration_type === 'google_sheets') {
        return {
          title: integration.integration_name,
          subtitle: integration.config.sheet_name ?
            `Sheet: ${integration.config.sheet_name}` :
            `Google Sheets`,
          loading: false,
          error: null,
          icon: <Database className="h-4 w-4 text-green-600" />
        }
      } else {
        return {
          title: info.database.title,
          subtitle: `Notion Database • ${Object.keys(info.database.properties).length} properties`,
          loading: false,
          error: null,
          icon: <Database className="h-4 w-4 text-blue-600" />
        }
      }
    }

    // Fallback for when no database info is available
    if (integration.integration_type === 'google_sheets') {
      return {
        title: integration.integration_name,
        subtitle: integration.config.sheet_name ?
          `Sheet: ${integration.config.sheet_name}` :
          `Google Sheets`,
        loading: false,
        error: null,
        icon: <Database className="h-4 w-4 text-green-600" />
      }
    } else {
      return {
        title: integration.integration_name,
        subtitle: `ID: ${formatDatabaseId(integration.config.database_id)}`,
        loading: false,
        error: null,
        icon: <Database className="h-4 w-4 text-gray-500" />
      }
    }
  }, [databasesInfo])

  if (availableDatabases.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label>Target Database</Label>
        <div className="flex items-center gap-3 p-4 border border-dashed border-gray-300 rounded-lg">
          <Database className="h-8 w-8 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">No databases connected</p>
            <p className="text-sm text-gray-600">
              Connect an integration in the integrations page to push data.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state while fetching database information
  if (isInitialLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label>Target Database</Label>
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
          <div>
            <p className="font-medium text-gray-900">Loading databases...</p>
            <p className="text-sm text-gray-600">
              Fetching integration information
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="database-select">Target Database</Label>
      <Select
        value={selectedIntegrationId}
        onValueChange={onSelect}
        disabled={disabled || isInitialLoading}
      >
        <SelectTrigger id="database-select" className="h-auto min-h-[2.5rem]">
          <SelectValue
            placeholder={
              isInitialLoading
                ? "Loading databases..."
                : availableDatabases.length > 0
                  ? "Choose a database"
                  : "No databases available"
            }
          >
            {selectedIntegrationId && (() => {
              const selected = availableDatabases.find(i => i.id === selectedIntegrationId)
              if (selected) {
                const displayInfo = getDatabaseDisplayInfo(selected)
                return (
                  <div className="flex items-center gap-2">
                    {displayInfo.icon}
                    <span className="truncate">{displayInfo.title}</span>
                  </div>
                )
              }
              return null
            })()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-w-[400px]">
          {availableDatabases.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Database className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">No databases connected</p>
              <p className="text-xs">Connect an integration first</p>
            </div>
          ) : (
            availableDatabases.map((integration) => {
              const displayInfo = getDatabaseDisplayInfo(integration)
              return (
                <SelectItem key={integration.id} value={integration.id} className="p-3">
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      {displayInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-sm truncate">{displayInfo.title}</div>
                        {getStatusIcon(integration)}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {displayInfo.subtitle}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={integration.is_active ? "default" : "secondary"}
                          className="text-xs px-1.5 py-0.5"
                        >
                          {integration.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {integration.last_sync && (
                          <span className="text-xs text-gray-400">
                            Last sync: {new Date(integration.last_sync).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              )
            })
          )}
        </SelectContent>
      </Select>

      {selectedIntegrationId && (
        <div className="text-sm">
          {(() => {
            const selected = availableDatabases.find(i => i.id === selectedIntegrationId)
            if (!selected) return null

            const displayInfo = getDatabaseDisplayInfo(selected)
            const databaseInfo = databasesInfo[selected.id]

            return (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {displayInfo.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-blue-900 mb-1">
                    Selected: {displayInfo.title}
                  </div>
                  <div className="text-blue-700 text-xs mb-2">
                    {displayInfo.subtitle}
                  </div>
                  {databaseInfo?.database && selected.integration_type === 'notion' && (
                    <div className="text-xs text-blue-600">
                      <div className="mb-1">
                        <strong>Available properties:</strong> {Object.keys(databaseInfo.database.properties).join(', ')}
                      </div>
                      <div>
                        <strong>Database URL:</strong>{' '}
                        <a
                          href={databaseInfo.database.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-800"
                        >
                          Open in Notion
                        </a>
                      </div>
                    </div>
                  )}
                  {selected.integration_type === 'google_sheets' && (
                    <div className="text-xs text-blue-600">
                      <div className="mb-1">
                        <strong>Spreadsheet:</strong> {selected.config.spreadsheet_id ? 'Configured' : 'Auto-create new'}
                      </div>
                      <div>
                        <strong>Sheet:</strong> {selected.config.sheet_name || 'Sheet1'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default DatabaseSelector
