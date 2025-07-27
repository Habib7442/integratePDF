'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useIntegrationsStore, useUIStore } from '@/stores'
import { getIntegrationById } from '@/lib/integrations'
import IntegrationTester from '@/components/integrations/IntegrationTester'
import {
  ArrowLeft,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Save,
  TestTube
} from 'lucide-react'

export default function IntegrationSettingsPage() {
  const { user: clerkUser, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const integrationId = params.id as string

  const [config, setConfig] = useState<Record<string, any>>({})
  const [integrationName, setIntegrationName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [showTester, setShowTester] = useState(false)
  const [testPassed, setTestPassed] = useState<boolean | null>(null)
  const [newApiKey, setNewApiKey] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const {
    userIntegrations,
    isLoading,
    error,
    fetchUserIntegrations,
    updateIntegrationConfig,
    disconnectIntegration,
    testIntegrationConnection
  } = useIntegrationsStore()

  const { showSuccessNotification, showErrorNotification } = useUIStore()

  // Find the current integration
  const currentIntegration = userIntegrations.find(i => i.id === integrationId)
  const integrationTemplate = currentIntegration ? getIntegrationById(currentIntegration.integration_type) : null

  useEffect(() => {
    if (isLoaded && clerkUser) {
      fetchUserIntegrations()
    }
  }, [isLoaded, clerkUser, fetchUserIntegrations])

  useEffect(() => {
    if (currentIntegration) {
      setConfig(currentIntegration.config || {})
      setIntegrationName(currentIntegration.integration_name || '')
      setIsActive(currentIntegration.is_active || false)
      setNewApiKey('') // Reset new API key when integration changes
    }
  }, [currentIntegration])

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading integration settings...</p>
        </div>
      </div>
    )
  }

  if (!currentIntegration || !integrationTemplate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Integration Not Found</h1>
          <p className="text-gray-600 mb-4">The requested integration could not be found.</p>
          <Button onClick={() => router.push('/dashboard/integrations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Integrations
          </Button>
        </div>
      </div>
    )
  }

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedConfig = { ...config }

      // If a new API key was provided, include it in the config
      if (newApiKey.trim()) {
        updatedConfig.api_key = newApiKey.trim()
      }

      await updateIntegrationConfig(integrationId, {
        ...updatedConfig,
        integration_name: integrationName,
        is_active: isActive
      })

      showSuccessNotification('Settings Updated', 'Integration settings have been saved successfully.')
      setNewApiKey('') // Clear the new API key field after successful save
    } catch (error) {
      showErrorNotification('Save Failed', 'Failed to save integration settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    try {
      // If there's a new API key, we need to test with the updated config
      const testConfig = { ...config }
      if (newApiKey.trim()) {
        testConfig.api_key = newApiKey.trim()
      }

      // For now, use the existing test method
      // TODO: Update testIntegrationConnection to accept config parameter
      const result = await testIntegrationConnection(integrationId)
      setTestPassed(result)
      if (result) {
        showSuccessNotification('Test Successful', 'Integration connection is working correctly.')
      } else {
        showErrorNotification('Test Failed', 'Integration connection test failed. Please check your settings.')
      }
    } catch (error) {
      setTestPassed(false)
      showErrorNotification('Test Error', 'Failed to test integration connection.')
    }
  }

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect this integration? This action cannot be undone.')) {
      try {
        await disconnectIntegration(integrationId)
        showSuccessNotification('Integration Disconnected', 'Integration has been disconnected successfully.')
        router.push('/dashboard/integrations')
      } catch (error) {
        showErrorNotification('Disconnect Failed', 'Failed to disconnect integration. Please try again.')
      }
    }
  }

  const getStatusBadge = () => {
    if (!isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    
    if (currentIntegration.last_sync) {
      const lastSync = new Date(currentIntegration.last_sync)
      const now = new Date()
      const diffHours = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
      
      if (diffHours < 24) {
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
      } else {
        return <Badge variant="destructive">Connection Issues</Badge>
      }
    }
    
    return <Badge variant="outline">Not Tested</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/integrations')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Integrations
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                {integrationTemplate.icon()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{integrationName || integrationTemplate.name}</h1>
                <p className="text-gray-600">{integrationTemplate.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Basic Settings
                </CardTitle>
                <CardDescription>
                  Configure the basic settings for your integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="integration-name">Integration Name</Label>
                  <Input
                    id="integration-name"
                    value={integrationName}
                    onChange={(e) => setIntegrationName(e.target.value)}
                    placeholder={`My ${integrationTemplate.name} Integration`}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm text-gray-600">Enable or disable this integration</p>
                  </div>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsActive(!isActive)}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Update your {integrationTemplate.name} connection settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrationTemplate.configFields.map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={field.key}>{field.label}</Label>

                    {field.type === 'token' ? (
                      // Special handling for API keys - show encrypted status and allow new input
                      <div className="space-y-3 mt-1">
                        {/* Current encrypted API key status */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">API Key Configured</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Encrypted
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Your API key is securely encrypted and cannot be displayed for security reasons.
                          </p>
                        </div>

                        {/* New API key input */}
                        <div>
                          <Label htmlFor={`new-${field.key}`} className="text-sm text-gray-600">
                            Update API Key (optional)
                          </Label>
                          <Input
                            id={`new-${field.key}`}
                            type="password"
                            value={newApiKey}
                            onChange={(e) => setNewApiKey(e.target.value)}
                            placeholder="Enter new API key to update"
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Leave empty to keep current API key unchanged
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Regular input for non-token fields
                      <div className="mt-1">
                        <Input
                          id={field.key}
                          type="text"
                          value={config[field.key] || ''}
                          onChange={(e) => handleConfigChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      </div>
                    )}

                    {field.description && field.type !== 'token' && (
                      <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleTest}
                  className="w-full"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </CardContent>
            </Card>

            {/* Integration Info */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Type:</span>
                  <span className="ml-2 text-gray-600">{integrationTemplate.name}</span>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(currentIntegration.created_at).toLocaleDateString()}
                  </span>
                </div>
                {currentIntegration.last_sync && (
                  <div>
                    <span className="font-medium">Last Sync:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(currentIntegration.last_sync).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
