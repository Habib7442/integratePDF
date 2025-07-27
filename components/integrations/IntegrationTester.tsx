'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IntegrationTester } from '@/lib/integrations/test-utils'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Play,
  Wifi,
  Key,
  Shield,
  Database
} from 'lucide-react'

interface IntegrationTesterProps {
  integrationType: 'notion' | 'airtable' | 'quickbooks'
  config: Record<string, any>
  onTestComplete?: (success: boolean) => void
}

const IntegrationTesterComponent: React.FC<IntegrationTesterProps> = ({
  integrationType,
  config,
  onTestComplete
}) => {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      let result
      
      switch (integrationType) {
        case 'notion':
          result = await IntegrationTester.testNotionIntegration(
            config.api_key,
            config.database_id
          )
          break
          
        case 'airtable':
          result = {
            success: false,
            error: 'Airtable integration not yet implemented',
            suggestions: ['Use Notion integration for now']
          }
          break
          
        case 'quickbooks':
          result = {
            success: false,
            error: 'QuickBooks integration not yet implemented',
            suggestions: ['Use Notion integration for now']
          }
          break
          
        default:
          result = {
            success: false,
            error: 'Unknown integration type'
          }
      }
      
      setTestResult(result)
      onTestComplete?.(result.success)
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
        suggestions: ['Check your configuration and try again']
      })
      onTestComplete?.(false)
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === undefined) return <div className="w-5 h-5 bg-gray-200 rounded-full" />
    return status ? 
      <CheckCircle className="w-5 h-5 text-green-600" /> : 
      <XCircle className="w-5 h-5 text-red-600" />
  }

  const getStatusBadge = (status: boolean | undefined) => {
    if (status === undefined) return <Badge variant="outline">Pending</Badge>
    return status ? 
      <Badge variant="default" className="bg-green-100 text-green-800">Passed</Badge> : 
      <Badge variant="destructive">Failed</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Integration Test
        </CardTitle>
        <CardDescription>
          Test your {integrationType} integration to ensure it's working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Button */}
        <Button 
          onClick={handleTest}
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Integration Test
            </>
          )}
        </Button>

        {/* Test Results */}
        {testResult && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  testResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {testResult.success ? 'Integration Test Passed' : 'Integration Test Failed'}
                </span>
              </div>
              
              {testResult.error && (
                <p className="text-sm text-red-800 mb-2">{testResult.error}</p>
              )}
            </div>

            {/* Detailed Test Results */}
            {testResult.details && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Test Details</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Connection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResult.details.connection)}
                      {getStatusBadge(testResult.details.connection)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Authentication</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResult.details.authentication)}
                      {getStatusBadge(testResult.details.authentication)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Permissions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResult.details.permissions)}
                      {getStatusBadge(testResult.details.permissions)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Data Validation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResult.details.dataValidation)}
                      {getStatusBadge(testResult.details.dataValidation)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {testResult.suggestions && testResult.suggestions.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Suggestions</span>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  {testResult.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>This test will verify:</p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>Connection to the {integrationType} API</li>
            <li>Authentication with your credentials</li>
            {integrationType === 'notion' && (
              <>
                <li>Access to your specified database</li>
                <li>Ability to create and modify entries</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default IntegrationTesterComponent
