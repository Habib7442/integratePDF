'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { ExtractedField } from '@/stores/types'
import { convertToCSV, downloadCSV } from '@/lib/csv-export'
import { toast } from 'sonner'

interface CSVExportButtonProps {
  extractedData: ExtractedField[]
  documentInfo: {
    filename: string
  }
  disabled?: boolean
  className?: string
}

const CSVExportButton: React.FC<CSVExportButtonProps> = ({
  extractedData,
  documentInfo,
  disabled = false,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const handleExport = async () => {
    if (!extractedData || extractedData.length === 0) {
      toast.error('No data available to export')
      return
    }

    setIsExporting(true)

    try {
      const csvData = convertToCSV(extractedData, documentInfo.filename)
      downloadCSV(csvData)

      setExportSuccess(true)
      toast.success(`CSV exported successfully!`, {
        description: `Downloaded ${csvData.filename}`
      })

    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsExporting(false)
      setTimeout(() => setExportSuccess(false), 3000) // Clear success indicator after 3 seconds
    }
  }

  const canExport = extractedData && extractedData.length > 0 && !disabled

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      disabled={!canExport || isExporting}
      className={`flex items-center gap-2 ${className}`}
    >
      {exportSuccess ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isExporting ? 'Exporting...' : 'Export CSV'}
      {!canExport && extractedData?.length === 0 && (
        <span className="text-xs text-gray-500 ml-2">No data</span>
      )}
    </Button>
  )
}

export default CSVExportButton
