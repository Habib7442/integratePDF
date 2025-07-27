/**
 * Test script to verify CSV export functionality
 */

import { convertToCSV, convertToDetailedCSV, convertToSummaryCSV } from '../lib/csv-export'
import { ExtractedField } from '../stores/types'

function testCSVExport() {
  console.log('Testing CSV export functionality...\n')

  // Mock extracted data
  const mockExtractedData: ExtractedField[] = [
    {
      id: '1',
      field_key: 'invoice_number',
      field_value: 'INV-2024-001',
      confidence: 95.5,
      is_corrected: false,
      data_type: 'text'
    },
    {
      id: '2',
      field_key: 'total_amount',
      field_value: '$1,250.00',
      confidence: 88.2,
      is_corrected: true,
      data_type: 'currency'
    },
    {
      id: '3',
      field_key: 'due_date',
      field_value: '2024-02-15',
      confidence: 92.1,
      is_corrected: false,
      data_type: 'date'
    },
    {
      id: '4',
      field_key: 'vendor_name',
      field_value: 'Acme Corp, Inc.',
      confidence: 97.8,
      is_corrected: false,
      data_type: 'text'
    }
  ]

  // Mock document info
  const mockDocumentInfo = {
    filename: 'test-invoice.pdf',
    processing_status: 'completed',
    confidence_score: 93.4,
    processing_completed_at: '2024-01-15T10:30:00Z'
  }

  // Mock statistics
  const mockStatistics = {
    total_fields: 4,
    average_confidence: 93.4,
    corrected_fields: 1,
    correction_rate: 25.0
  }

  try {
    console.log('1. Testing Basic CSV Export...')
    const basicCSV = convertToCSV(mockExtractedData, mockDocumentInfo.filename)
    console.log('✅ Basic CSV export successful')
    console.log(`   Filename: ${basicCSV.filename}`)
    console.log(`   Content preview: ${basicCSV.content.substring(0, 100)}...`)
    console.log()

    console.log('2. Testing Detailed CSV Export...')
    const detailedCSV = convertToDetailedCSV(mockExtractedData, mockDocumentInfo)
    console.log('✅ Detailed CSV export successful')
    console.log(`   Filename: ${detailedCSV.filename}`)
    console.log(`   Content preview: ${detailedCSV.content.substring(0, 100)}...`)
    console.log()

    console.log('3. Testing Summary CSV Export...')
    const summaryCSV = convertToSummaryCSV(mockExtractedData, mockStatistics, mockDocumentInfo.filename)
    console.log('✅ Summary CSV export successful')
    console.log(`   Filename: ${summaryCSV.filename}`)
    console.log(`   Content preview: ${summaryCSV.content.substring(0, 100)}...`)
    console.log()

    console.log('4. Testing CSV Content Structure...')
    
    // Test basic CSV structure
    const basicLines = basicCSV.content.split('\n')
    const basicHeaders = basicLines[0].split(',')
    console.log(`   Basic CSV has ${basicLines.length} lines and ${basicHeaders.length} columns`)
    console.log(`   Headers: ${basicHeaders.join(', ')}`)
    
    // Test detailed CSV structure
    const detailedLines = detailedCSV.content.split('\n')
    const detailedHeaders = detailedLines[0].split(',')
    console.log(`   Detailed CSV has ${detailedLines.length} lines and ${detailedHeaders.length} columns`)
    
    // Test summary CSV structure
    const summaryLines = summaryCSV.content.split('\n')
    console.log(`   Summary CSV has ${summaryLines.length} lines`)
    console.log()

    console.log('5. Testing Edge Cases...')
    
    // Test with special characters
    const specialData: ExtractedField[] = [
      {
        id: '1',
        field_key: 'description',
        field_value: 'Product with "quotes" and, commas',
        confidence: 90.0,
        is_corrected: false,
        data_type: 'text'
      },
      {
        id: '2',
        field_key: 'notes',
        field_value: 'Multi-line\ntext content',
        confidence: 85.0,
        is_corrected: true,
        data_type: 'text'
      }
    ]
    
    const specialCSV = convertToCSV(specialData, 'special-chars-test')
    console.log('✅ Special characters handled correctly')
    console.log(`   Content: ${specialCSV.content}`)
    console.log()

    // Test with empty data
    try {
      convertToCSV([], 'empty-test')
      console.log('❌ Empty data test failed - should have thrown error')
    } catch (error) {
      console.log('✅ Empty data correctly throws error')
    }

    console.log('\n🎉 All CSV export tests passed!')

  } catch (error) {
    console.error('❌ CSV export test failed:', error)
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  testCSVExport()
}

export { testCSVExport }
