import { ExtractedField } from '@/stores/types'

/**
 * Converts extracted PDF data to simplified CSV format with only essential fields
 * @param extractedData - Array of extracted fields
 * @param documentName - Name of the document for the filename
 * @returns Object with CSV content and suggested filename
 */
export function convertToCSV(extractedData: ExtractedField[], documentName: string) {
  if (!extractedData || extractedData.length === 0) {
    throw new Error('No data to export')
  }

  // Define simplified CSV headers (only essential fields)
  const headers = [
    'Field Name',
    'Field Value'
  ]

  // Convert data to CSV rows (excluding technical fields)
  const rows = extractedData.map(field => [
    field.field_key || '',
    field.field_value || ''
  ])

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row =>
      row.map(cell => {
        // Escape quotes and wrap in quotes if necessary
        const cellStr = String(cell)
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(',')
    )
    .join('\n')

  // Generate filename
  const sanitizedDocumentName = documentName
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `${sanitizedDocumentName}_extracted_data_${timestamp}.csv`

  return {
    content: csvContent,
    filename,
    mimeType: 'text/csv'
  }
}

/**
 * Downloads CSV content as a file
 * @param csvData - CSV data object from convertToCSV
 */
export function downloadCSV(csvData: { content: string; filename: string; mimeType: string }) {
  // Create blob
  const blob = new Blob([csvData.content], { type: csvData.mimeType })
  
  // Create download link
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = csvData.filename
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
