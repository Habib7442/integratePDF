'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { UserIntegration } from '@/stores/types'

interface NotionDatabase {
  id: string
  name: string
  api_key: string
  database_id: string
  isActive: boolean
  lastSync?: string
}

interface NotionDatabaseManagerProps {
  userIntegrations: UserIntegration[]
  onAddDatabase: (database: Omit<NotionDatabase, 'id' | 'isActive'>) => Promise<void>
  onRemoveDatabase: (integrationId: string) => Promise<void>
  onTestDatabase: (database: Omit<NotionDatabase, 'id' | 'isActive'>) => Promise<boolean>
  isLoading?: boolean
}

const NotionDatabaseManager: React.FC<NotionDatabaseManagerProps> = ({
  userIntegrations,
  onAddDatabase,
  onRemoveDatabase,
  onTestDatabase,
  isLoading = false
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDatabase, setNewDatabase] = useState({
    name: '',
    api_key: '',
    database_id: ''
  })
  const [testingDatabase, setTestingDatabase] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  // Filter for Notion integrations only
  const notionIntegrations = userIntegrations.filter(
    integration => integration.integration_type === 'notion'
  )

  const handleAddDatabase = async () => {
    if (!newDatabase.name || !newDatabase.api_key || !newDatabase.database_id) {
      return
    }

    try {
      await onAddDatabase(newDatabase)
      setNewDatabase({ name: '', api_key: '', database_id: '' })
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add database:', error)
    }
  }

  const handleTestDatabase = async (integration: UserIntegration) => {
    const databaseKey = `${integration.config.api_key}-${integration.config.database_id}`
    setTestingDatabase(databaseKey)
    
    try {
      const result = await onTestDatabase({
        name: integration.integration_name,
        api_key: integration.config.api_key,
        database_id: integration.config.database_id
      })
      
      setTestResults(prev => ({ ...prev, [integration.id]: result }))
    } catch (error) {
      setTestResults(prev => ({ ...prev, [integration.id]: false }))
    } finally {
      setTestingDatabase(null)
    }
  }

  const formatDatabaseId = (id: string) => {
    return id.length > 20 ? `${id.substring(0, 8)}...${id.substring(id.length - 8)}` : id
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notion Databases</h3>
          <p className="text-sm text-gray-600">
            Manage your connected Notion databases. You can connect multiple databases and choose which one to use when pushing data.
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Database
        </Button>
      </div>

      {/* Existing Databases */}
      <div className="grid gap-4">
        {notionIntegrations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Database className="h-12 w-12 text-gray-400 mb-4" />
              <h4 className="font-medium text-gray-900 mb-2">No databases connected</h4>
              <p className="text-sm text-gray-600 text-center mb-4">
                Connect your first Notion database to start pushing extracted data automatically.
              </p>
              <Button onClick={() => setShowAddForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Connect Database
              </Button>
            </CardContent>
          </Card>
        ) : (
          notionIntegrations.map((integration) => {
            const isTestingThis = testingDatabase === `${integration.config.api_key}-${integration.config.database_id}`
            const testResult = testResults[integration.id]
            
            return (
              <Card key={integration.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{integration.integration_name}</h4>
                        <Badge variant={integration.is_active ? "default" : "secondary"}>
                          {integration.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {testResult !== undefined && (
                          <Badge variant={testResult ? "default" : "destructive"} className="flex items-center gap-1">
                            {testResult ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Connected
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                Failed
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Database ID: <code className="bg-gray-100 px-1 rounded text-xs">
                          {formatDatabaseId(integration.config.database_id)}
                        </code></div>
                        {integration.last_sync && (
                          <div>Last sync: {new Date(integration.last_sync).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestDatabase(integration)}
                        disabled={isTestingThis || isLoading}
                      >
                        {isTestingThis ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Testing...
                          </>
                        ) : (
                          'Test Connection'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveDatabase(integration.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Add Database Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Notion Database</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="database-name">Database Name</Label>
              <Input
                id="database-name"
                placeholder="e.g., Invoice Database"
                value={newDatabase.name}
                onChange={(e) => setNewDatabase(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="api-key">Internal Integration Secret</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Notion internal integration secret"
                value={newDatabase.api_key}
                onChange={(e) => setNewDatabase(prev => ({ ...prev, api_key: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="database-id">Database ID</Label>
              <Input
                id="database-id"
                placeholder="32-character database ID"
                value={newDatabase.database_id}
                onChange={(e) => setNewDatabase(prev => ({ ...prev, database_id: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddDatabase}
                disabled={!newDatabase.name || !newDatabase.api_key || !newDatabase.database_id || isLoading}
              >
                Add Database
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setNewDatabase({ name: '', api_key: '', database_id: '' })
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default NotionDatabaseManager
