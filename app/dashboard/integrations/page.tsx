'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useIntegrations } from '@/stores'
import { INTEGRATIONS, getIntegrationById } from '@/lib/integrations'
import IntegrationSelector from '@/components/integrations/IntegrationSelector'
import NotionDatabaseManager from '@/components/integrations/NotionDatabaseManager'
import { 
  ArrowLeft, 
  Settings, 
  Trash2, 
  Plus, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

export default function IntegrationsPage() {
  const { user: clerkUser, isLoaded } = useUser()
  const router = useRouter()
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [showConnectForm, setShowConnectForm] = useState(false)

  const {
    userIntegrations,
    isLoading,
    error,
    fetchUserIntegrations,
    disconnectIntegration,
    connectIntegration,
    testIntegrationConnection,
    clearError
  } = useIntegrations()

  useEffect(() => {
    if (isLoaded && clerkUser) {
      fetchUserIntegrations()
    }
  }, [isLoaded, clerkUser, fetchUserIntegrations])

  const handleDisconnect = async (integrationId: string) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      await disconnectIntegration(integrationId)
    }
  }

  const handleAddDatabase = async (database: { name: string; api_key: string; database_id: string }) => {
    await connectIntegration('notion', {
      api_key: database.api_key,
      database_id: database.database_id
    }, database.name)
  }

  const handleTestDatabase = async (database: { name: string; api_key: string; database_id: string }) => {
    const result = await testIntegrationConnection('notion', {
      api_key: database.api_key,
      database_id: database.database_id
    })
    return result.success
  }

  const getStatusBadge = (integration: any) => {
    if (integration.is_active) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Disconnected
        </Badge>
      )
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
              <p className="text-gray-600">Connect your favorite tools to automate data workflows</p>
            </div>
            
            <Button 
              onClick={() => setShowConnectForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Integration
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Available Integrations */}
        {showConnectForm && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Connect New Integration</CardTitle>
                  <CardDescription>
                    Choose an integration to connect to your account
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowConnectForm(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <IntegrationSelector
                selectedIntegration={selectedIntegration}
                onSelect={(id) => {
                  setSelectedIntegration(id)
                  // Navigate to connection flow
                  router.push(`/dashboard/integrations/connect/${id}`)
                }}
                showOnlyAvailable={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Connected Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Your Integrations</CardTitle>
            <CardDescription>
              Manage your connected integrations and their settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading integrations...</p>
              </div>
            ) : userIntegrations.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ExternalLink className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations connected</h3>
                <p className="text-gray-600 mb-6">
                  Connect your first integration to start automating your data workflows
                </p>
                <Button onClick={() => setShowConnectForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Integration
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userIntegrations.map((integration) => {
                  const integrationDef = getIntegrationById(integration.integration_type)
                  
                  return (
                    <div 
                      key={integration.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {integrationDef?.icon()}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {integration.integration_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {integrationDef?.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(integration)}
                            {integration.last_sync && (
                              <span className="text-xs text-gray-500">
                                Last sync: {new Date(integration.last_sync).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/integrations/${integration.id}`)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Settings
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(integration.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notion Database Manager */}
        <Card>
          <CardContent className="p-6">
            <NotionDatabaseManager
              userIntegrations={userIntegrations}
              onAddDatabase={handleAddDatabase}
              onRemoveDatabase={handleDisconnect}
              onTestDatabase={handleTestDatabase}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
