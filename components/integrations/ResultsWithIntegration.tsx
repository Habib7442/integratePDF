'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExtractedData, ExtractedField } from '@/stores/types'
import { useIntegrations, useIntegrationPush } from '@/stores'
import DatabaseSelector from './DatabaseSelector'
import CSVExportButton from '@/components/export/CSVExportButton'
import {
  CheckCircle,
  ExternalLink,
  Send,
  AlertCircle,
  Loader2,
  ArrowRight,
  Edit2,
  Save,
  X
} from 'lucide-react'

interface ResultsWithIntegrationProps {
  document: ExtractedData['document']
  extractedData: ExtractedField[]
  statistics: ExtractedData['statistics']
  onFieldUpdate: (fieldId: string, newValue: string) => void
  onRetryExtraction: () => void
}

const ResultsWithIntegration: React.FC<ResultsWithIntegrationProps> = ({
  document,
  extractedData,
  statistics,
  onFieldUpdate,
  onRetryExtraction
}) => {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [showPushSuccess, setShowPushSuccess] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const { userIntegrations, fetchUserIntegrations } = useIntegrations()
  const { isPushing, pushDataToIntegration, error: pushError } = useIntegrationPush()

  useEffect(() => {
    fetchUserIntegrations()
  }, [fetchUserIntegrations])

  const handleEdit = (field: ExtractedField) => {
    setEditingField(field.id)
    setEditValue(field.field_value)
  }

  const handleSave = async (fieldId: string) => {
    if (updating) return

    setUpdating(fieldId)
    try {
      await onFieldUpdate(fieldId, editValue)
      setEditingField(null)
    } catch (error) {
      console.error('Failed to update field:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setEditValue('')
  }

  const handlePushToIntegration = async () => {
    if (!selectedIntegration) return

    try {
      await pushDataToIntegration(selectedIntegration, document.id, extractedData)
      setShowPushSuccess(true)
      setTimeout(() => setShowPushSuccess(false), 5000)
    } catch (error) {
      console.error('Failed to push data:', error)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge variant="default" className="bg-green-100 text-green-800">High</Badge>
    if (confidence >= 0.6) return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Medium</Badge>
    return <Badge variant="destructive">Low</Badge>
  }

  const selectedIntegrationData = userIntegrations.find(i => i.id === selectedIntegration)

  return (
    <div className="space-y-6">
      {/* Extraction Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Extraction Complete
              </CardTitle>
              <CardDescription>
                Data extracted from {document.filename}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{statistics.total_fields}</div>
              <div className="text-sm text-gray-500">fields extracted</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{(statistics.average_confidence * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Avg. Confidence</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{statistics.corrected_fields}</div>
              <div className="text-sm text-gray-600">Corrections Made</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{(statistics.correction_rate * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Correction Rate</div>
            </div>
          </div>

          {/* Extracted Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Field</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Value</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Confidence</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {extractedData.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {field.field_key}
                    </td>
                    <td className="px-4 py-3">
                      {editingField === field.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSave(field.id)}
                            disabled={updating === field.id}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                            title="Save"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {field.field_value}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getConfidenceColor(field.confidence)}`}>
                          {(field.confidence * 100).toFixed(0)}%
                        </span>
                        {getConfidenceBadge(field.confidence)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{field.data_type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {editingField !== field.id && (
                        <button
                          onClick={() => handleEdit(field)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {extractedData.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No data was extracted from this document.</p>
              <Button 
                onClick={onRetryExtraction}
                variant="outline"
                className="mt-4"
              >
                Retry Extraction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Push */}
      {extractedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Push to Integration
            </CardTitle>
            <CardDescription>
              Send this extracted data to your connected integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Success Message */}
            {showPushSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    Data successfully pushed to {selectedIntegrationData?.integration_name}!
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {pushError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-900">{pushError}</span>
                </div>
              </div>
            )}

            {/* Integration Selection */}
            {userIntegrations.length > 0 ? (
              <div className="space-y-4">
                <DatabaseSelector
                  selectedIntegrationId={selectedIntegration}
                  onSelect={setSelectedIntegration}
                />

                {selectedIntegration && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <div className="font-medium text-blue-900">Ready to push data</div>
                        <div className="text-blue-700">
                          {extractedData.length} fields will be sent to {selectedIntegrationData?.integration_name}
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handlePushToIntegration}
                      disabled={isPushing}
                      className="flex items-center gap-2"
                    >
                      {isPushing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Pushing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Push Data
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No integrations connected</h3>
                <p className="text-gray-600 mb-4">
                  Connect an integration to automatically push extracted data
                </p>
                <Button 
                  onClick={() => window.open('/dashboard/integrations', '_blank')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Set up integrations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download your extracted data in CSV format for use in other applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium mb-1">CSV Export</h4>
              <p className="text-sm text-gray-600">
                Export {extractedData.length} extracted fields to CSV format
              </p>
            </div>
            <CSVExportButton
              extractedData={extractedData}
              documentInfo={document}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResultsWithIntegration
