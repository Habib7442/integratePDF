'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useIntegrations, useUIStore } from '@/stores'
import { getIntegrationById } from '@/lib/integrations'
import IntegrationTester from '@/components/integrations/IntegrationTester'
import { ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react'

export default function ConnectIntegrationPage() {
  const router = useRouter()
  const params = useParams()
  const integrationType = params.type as string

  const [config, setConfig] = useState<Record<string, string>>({})
  const [integrationName, setIntegrationName] = useState('')
  const [showTester, setShowTester] = useState(false)
  const [testPassed, setTestPassed] = useState(false)

  const {
    isConnecting,
    error,
    connectIntegration,
    clearError
  } = useIntegrations()

  const { showSuccessNotification, showErrorNotification } = useUIStore()

  const integration = getIntegrationById(integrationType)

  if (!integration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Integration Not Found</h1>
          <p className="text-gray-600 mb-4">The requested integration type is not available.</p>
          <Button onClick={() => router.push('/dashboard/integrations')}>
            Back to Integrations
          </Button>
        </div>
      </div>
    )
  }

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleConnect = async () => {
    try {
      clearError()

      // Validate required fields
      const missingFields = integration.configFields?.filter(field =>
        field.required && !config[field.key]
      ) || []

      if (missingFields.length > 0) {
        const errorMessage = `Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`
        showErrorNotification('Missing Required Fields', errorMessage)
        return
      }

      const result = await connectIntegration(
        integration.type,
        {
          ...config,
          integration_name: integrationName || integration.name
        }
      )

      // Show success notification
      showSuccessNotification(
        'Integration Connected!',
        `Successfully connected ${integrationName || integration.name}. You can now push data to this integration.`
      )

      router.push('/dashboard/integrations')
    } catch (error) {
      console.error('Failed to connect integration:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect integration'
      showErrorNotification('Connection Failed', errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/integrations')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Integrations
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {integration.icon()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Connect {integration.name}</h1>
              <p className="text-gray-600">{integration.description}</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Connection Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Enter the required information to connect your {integration.name} account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Integration Name */}
            <div>
              <Label htmlFor="integration-name">Integration Name</Label>
              <Input
                id="integration-name"
                type="text"
                value={integrationName}
                onChange={(e) => setIntegrationName(e.target.value)}
                placeholder={`My ${integration.name} Integration`}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Give this integration a name to help you identify it
              </p>
            </div>

            {/* Dynamic Config Fields */}
            {integration.configFields?.map((field) => (
              <div key={field.key}>
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                
                {field.type === 'select' ? (
                  <select
                    id={field.key}
                    value={config[field.key] || ''}
                    onChange={(e) => handleConfigChange(field.key, e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required={field.required}
                  >
                    <option value="">Select an option</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type === 'token' ? 'password' : 'text'}
                    value={config[field.key] || ''}
                    onChange={(e) => handleConfigChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="mt-1"
                  />
                )}
                
                {field.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {field.description}
                  </p>
                )}
              </div>
            ))}

            {/* Integration-specific instructions */}
            {integration.type === 'notion' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">How to get your Notion Internal Integration Secret:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="underline">notion.so/my-integrations</a></li>
                    <li>Click "Create new integration"</li>
                    <li>Give your integration a name (e.g., "IntegratePDF")</li>
                    <li>Select the workspace where your database is located</li>
                    <li>Copy the "Internal Integration Token"</li>
                    <li>Share your database with the integration in Notion</li>
                  </ol>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">How to get your Notion Database ID:</h4>
                  <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                    <li>Open your Notion database in a web browser</li>
                    <li>Copy the URL from the address bar</li>
                    <li>The database ID is the 32-character string after the last slash</li>
                    <li>Example: notion.so/myworkspace/abc123...xyz789 → abc123...xyz789</li>
                  </ol>
                </div>

                <a
                  href="https://developers.notion.com/docs/create-a-notion-integration"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  Complete setup guide <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Test Integration */}
            {integration.type === 'notion' && config.api_key && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Test Configuration</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTester(!showTester)}
                  >
                    {showTester ? 'Hide Test' : 'Test Connection'}
                  </Button>
                </div>

                {showTester && (
                  <IntegrationTester
                    integrationType={integration.type}
                    config={config}
                    onTestComplete={setTestPassed}
                  />
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleConnect}
                disabled={isConnecting || (showTester && !testPassed)}
                className="flex-1"
              >
                {isConnecting ? 'Connecting...' : `Connect ${integration.name}`}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/integrations')}
                disabled={isConnecting}
              >
                Cancel
              </Button>
            </div>

            {showTester && !testPassed && (
              <p className="text-sm text-amber-600 text-center">
                Please test your configuration before connecting
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
