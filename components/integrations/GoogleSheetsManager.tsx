'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, ExternalLink, Plus, Sheet, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { UserIntegration } from '@/stores/types'
import { GoogleSheetsSpreadsheet, GoogleSheetsSheet } from '@/lib/integrations/google-sheets'

interface GoogleSheetsManagerProps {
  integration: UserIntegration
  onConfigUpdate: (config: Record<string, any>) => void
}

export function GoogleSheetsManager({ integration, onConfigUpdate }: GoogleSheetsManagerProps) {
  const [spreadsheets, setSpreadsheets] = useState<GoogleSheetsSpreadsheet[]>([])
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<GoogleSheetsSpreadsheet | null>(null)
  const [selectedSheetName, setSelectedSheetName] = useState<string>('')
  const [newSpreadsheetTitle, setNewSpreadsheetTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Initialize from existing config
  useEffect(() => {
    if (integration.config.spreadsheet_id) {
      fetchSpreadsheet(integration.config.spreadsheet_id)
    }
    if (integration.config.sheet_name) {
      setSelectedSheetName(integration.config.sheet_name)
    }
  }, [integration.config])

  const fetchSpreadsheet = async (spreadsheetId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/integrations/google-sheets/spreadsheets?spreadsheetId=${spreadsheetId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch spreadsheet')
      }
      const spreadsheet = await response.json()
      setSelectedSpreadsheet(spreadsheet)
      setSpreadsheets(prev => {
        const exists = prev.find(s => s.id === spreadsheet.id)
        if (exists) return prev
        return [spreadsheet, ...prev]
      })
    } catch (error) {
      console.error('Error fetching spreadsheet:', error)
      toast.error('Failed to fetch spreadsheet details')
    } finally {
      setIsLoading(false)
    }
  }

  const createSpreadsheet = async () => {
    if (!newSpreadsheetTitle.trim()) {
      toast.error('Please enter a spreadsheet title')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/integrations/google-sheets/spreadsheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newSpreadsheetTitle.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create spreadsheet')
      }

      const newSpreadsheet = await response.json()
      setSpreadsheets(prev => [newSpreadsheet, ...prev])
      setSelectedSpreadsheet(newSpreadsheet)
      setSelectedSheetName(newSpreadsheet.sheets[0]?.title || 'Sheet1')
      setNewSpreadsheetTitle('')
      
      // Update integration config
      onConfigUpdate({
        spreadsheet_id: newSpreadsheet.id,
        sheet_name: newSpreadsheet.sheets[0]?.title || 'Sheet1'
      })

      toast.success('Spreadsheet created successfully!')
    } catch (error) {
      console.error('Error creating spreadsheet:', error)
      toast.error('Failed to create spreadsheet')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSpreadsheetSelect = (spreadsheetId: string) => {
    const spreadsheet = spreadsheets.find(s => s.id === spreadsheetId)
    if (spreadsheet) {
      setSelectedSpreadsheet(spreadsheet)
      setSelectedSheetName(spreadsheet.sheets[0]?.title || 'Sheet1')
      onConfigUpdate({
        spreadsheet_id: spreadsheet.id,
        sheet_name: spreadsheet.sheets[0]?.title || 'Sheet1'
      })
    }
  }

  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheetName(sheetName)
    onConfigUpdate({
      spreadsheet_id: selectedSpreadsheet?.id,
      sheet_name: sheetName
    })
  }

  const refreshSpreadsheet = () => {
    if (selectedSpreadsheet) {
      fetchSpreadsheet(selectedSpreadsheet.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Configuration */}
      {selectedSpreadsheet && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Sheet className="w-5 h-5" />
              Current Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 font-medium">{selectedSpreadsheet.name}</p>
                <p className="text-slate-500 text-sm">ID: {selectedSpreadsheet.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshSpreadsheet}
                  disabled={isLoading}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedSpreadsheet.url, '_blank')}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Sheet Selection */}
            <div>
              <Label className="text-slate-300">Target Sheet</Label>
              <Select value={selectedSheetName} onValueChange={handleSheetSelect}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue placeholder="Select a sheet" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {selectedSpreadsheet.sheets.map((sheet) => (
                    <SelectItem key={sheet.id} value={sheet.title} className="text-slate-100">
                      {sheet.title}
                      <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300">
                        {sheet.rowCount}×{sheet.columnCount}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Spreadsheet */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Spreadsheet
          </CardTitle>
          <CardDescription className="text-slate-400">
            Create a new Google Sheets spreadsheet for your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="spreadsheet-title" className="text-slate-300">
              Spreadsheet Title
            </Label>
            <Input
              id="spreadsheet-title"
              value={newSpreadsheetTitle}
              onChange={(e) => setNewSpreadsheetTitle(e.target.value)}
              placeholder="Enter spreadsheet title"
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
            />
          </div>
          <Button
            onClick={createSpreadsheet}
            disabled={isCreating || !newSpreadsheetTitle.trim()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Spreadsheet
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Manual Spreadsheet ID Input */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Use Existing Spreadsheet</CardTitle>
          <CardDescription className="text-slate-400">
            Enter the ID of an existing Google Sheets spreadsheet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="spreadsheet-id" className="text-slate-300">
              Spreadsheet ID
            </Label>
            <Input
              id="spreadsheet-id"
              placeholder="Enter Google Sheets spreadsheet ID"
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
              onBlur={(e) => {
                const id = e.target.value.trim()
                if (id && id !== selectedSpreadsheet?.id) {
                  fetchSpreadsheet(id)
                }
              }}
            />
            <p className="text-slate-500 text-sm mt-1">
              You can find the spreadsheet ID in the URL: 
              <code className="text-slate-400 bg-slate-700 px-1 rounded ml-1">
                /spreadsheets/d/[SPREADSHEET_ID]/edit
              </code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
