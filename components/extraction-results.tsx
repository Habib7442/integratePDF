'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Edit2, Save, X, FileText, TrendingUp } from 'lucide-react'

interface ExtractedField {
  id: string
  field_key: string
  field_value: string
  confidence: number
  is_corrected: boolean
  data_type: string
}

interface ExtractionResultsProps {
  document: {
    id: string
    filename: string
    processing_status: string
    confidence_score: number
    processing_completed_at: string
  }
  extractedData: ExtractedField[]
  statistics: {
    total_fields: number
    average_confidence: number
    corrected_fields: number
    correction_rate: number
  }
  onFieldUpdate: (fieldId: string, newValue: string) => Promise<void>
  onRetryExtraction?: () => void
}

export default function ExtractionResults({
  document,
  extractedData,
  statistics,
  onFieldUpdate,
  onRetryExtraction
}: ExtractionResultsProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50'
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High'
    if (confidence >= 0.7) return 'Medium'
    return 'Low'
  }

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
      // You could add a toast notification here
    } finally {
      setUpdating(null)
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setEditValue('')
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Extraction Complete</h2>
              <p className="text-gray-600">
                Data from <span className="font-semibold text-blue-600">{document.filename}</span>
              </p>
            </div>
          </div>
          
          {document.processing_status === 'completed' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Processing Complete</span>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Fields</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{statistics.total_fields}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Avg Confidence</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{Math.round(statistics.average_confidence * 100)}%</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Corrected</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{statistics.corrected_fields}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Correction Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{statistics.correction_rate}%</p>
          </div>
        </div>
      </div>

      {/* Extracted Data Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Extracted Data</h3>
          <p className="text-sm text-gray-600">Click any field to edit and correct the extracted value</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {extractedData.map((field) => (
                <tr key={field.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{field.field_key}</div>
                    <div className="text-xs text-gray-500">{field.data_type}</div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {editingField === field.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(field.id)}
                          disabled={updating === field.id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {field.field_value}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(field.confidence)}`}>
                        {getConfidenceLabel(field.confidence)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(field.confidence * 100)}%
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {field.is_corrected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                        <Edit2 className="h-3 w-3" />
                        Corrected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Original
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingField !== field.id && (
                      <button
                        onClick={() => handleEdit(field)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
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
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No data was extracted from this document.</p>
            {onRetryExtraction && (
              <button
                onClick={onRetryExtraction}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry Extraction
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
