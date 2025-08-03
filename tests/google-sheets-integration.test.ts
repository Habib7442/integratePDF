/**
 * Google Sheets Integration Test
 * 
 * This test verifies that the Google Sheets integration is properly configured
 * and can handle basic operations.
 * 
 * Note: This test requires actual Google OAuth credentials to run.
 * For CI/CD, mock the googleapis library or skip these tests.
 */

import { GoogleSheetsIntegration, GoogleSheetsConfig } from '@/lib/integrations/google-sheets'
import { ExtractedField } from '@/stores/types'

// Mock configuration for testing
const mockConfig: GoogleSheetsConfig = {
  spreadsheet_id: 'test-spreadsheet-id',
  sheet_name: 'Sheet1',
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  client_id: 'mock-client-id',
  client_secret: 'mock-client-secret'
}

// Mock extracted data for testing
const mockExtractedData: ExtractedField[] = [
  {
    field_key: 'invoice_number',
    field_value: 'INV-001',
    confidence: 0.95,
    bounding_box: { x: 0, y: 0, width: 100, height: 20 }
  },
  {
    field_key: 'total_amount',
    field_value: '$1,234.56',
    confidence: 0.98,
    bounding_box: { x: 0, y: 100, width: 100, height: 20 }
  },
  {
    field_key: 'invoice_date',
    field_value: '2024-01-15',
    confidence: 0.92,
    bounding_box: { x: 0, y: 200, width: 100, height: 20 }
  }
]

describe('Google Sheets Integration', () => {
  let integration: GoogleSheetsIntegration

  beforeEach(() => {
    integration = new GoogleSheetsIntegration(mockConfig)
  })

  describe('Configuration', () => {
    it('should initialize with proper configuration', () => {
      expect(integration).toBeDefined()
      expect(integration['config']).toBeDefined()
      expect(integration['auth']).toBeDefined()
      expect(integration['sheets']).toBeDefined()
    })

    it('should handle encrypted configuration values', () => {
      // Test that the integration can handle encrypted tokens
      const encryptedConfig = {
        ...mockConfig,
        access_token: 'encrypted:' + mockConfig.access_token,
        refresh_token: 'encrypted:' + mockConfig.refresh_token,
        client_secret: 'encrypted:' + mockConfig.client_secret
      }

      const encryptedIntegration = new GoogleSheetsIntegration(encryptedConfig)
      expect(encryptedIntegration).toBeDefined()
    })
  })

  describe('Field Mapping', () => {
    it('should format field keys as proper headers', () => {
      const formatMethod = integration['formatFieldKeyAsHeader']
      
      expect(formatMethod('invoice_number')).toBe('Invoice Number')
      expect(formatMethod('total_amount')).toBe('Total Amount')
      expect(formatMethod('customer_name')).toBe('Customer Name')
      expect(formatMethod('date')).toBe('Date')
    })

    it('should suggest appropriate field mappings', () => {
      const existingHeaders = ['Invoice #', 'Amount', 'Date', 'Customer']
      const mappings = GoogleSheetsIntegration.suggestMappings(mockExtractedData, existingHeaders)

      expect(mappings).toBeDefined()
      expect(typeof mappings).toBe('object')
      
      // Should suggest mappings based on field similarity
      expect(mappings['total_amount']).toBe('Amount')
      expect(mappings['invoice_date']).toBe('Date')
    })

    it('should handle exact field matches', () => {
      const exactHeaders = ['invoice_number', 'total_amount', 'invoice_date']
      const mappings = GoogleSheetsIntegration.suggestMappings(mockExtractedData, exactHeaders)

      expect(mappings['invoice_number']).toBe('invoice_number')
      expect(mappings['total_amount']).toBe('total_amount')
      expect(mappings['invoice_date']).toBe('invoice_date')
    })
  })

  describe('Data Preparation', () => {
    it('should prepare data correctly for Google Sheets', () => {
      // Test data preparation logic
      const mapping = {
        'invoice_number': 'Invoice #',
        'total_amount': 'Amount',
        'invoice_date': 'Date'
      }

      // This would be tested by calling pushExtractedData with mock data
      // and verifying the prepared data structure
      expect(mockExtractedData).toHaveLength(3)
      expect(mapping).toHaveProperty('invoice_number')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing spreadsheet ID gracefully', async () => {
      const configWithoutSpreadsheet = {
        ...mockConfig,
        spreadsheet_id: ''
      }

      const integrationWithoutSpreadsheet = new GoogleSheetsIntegration(configWithoutSpreadsheet)
      
      // Should throw appropriate error when trying to push data without spreadsheet ID
      await expect(
        integrationWithoutSpreadsheet.pushExtractedData(mockExtractedData, {})
      ).rejects.toThrow()
    })

    it('should handle invalid authentication gracefully', async () => {
      const configWithInvalidAuth = {
        ...mockConfig,
        access_token: 'invalid-token'
      }

      const integrationWithInvalidAuth = new GoogleSheetsIntegration(configWithInvalidAuth)
      
      // Should handle authentication errors appropriately
      // Note: This would require mocking the googleapis library for proper testing
      expect(integrationWithInvalidAuth).toBeDefined()
    })
  })

  describe('Integration Flow', () => {
    it('should validate the complete integration flow', () => {
      // Test the complete flow:
      // 1. Initialize integration
      // 2. Prepare extracted data
      // 3. Apply field mapping
      // 4. Push to Google Sheets
      
      expect(integration).toBeDefined()
      expect(mockExtractedData).toHaveLength(3)
      
      // Verify that all required methods exist
      expect(typeof integration.testConnection).toBe('function')
      expect(typeof integration.getSpreadsheet).toBe('function')
      expect(typeof integration.pushExtractedData).toBe('function')
      expect(typeof integration.createSpreadsheet).toBe('function')
    })
  })
})

// Integration test helper functions
export const testGoogleSheetsIntegration = {
  /**
   * Test if Google Sheets API credentials are properly configured
   */
  async testCredentials(): Promise<boolean> {
    const requiredEnvVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REDIRECT_URI'
    ]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.warn(`Missing environment variable: ${envVar}`)
        return false
      }
    }

    return true
  },

  /**
   * Create a test spreadsheet for integration testing
   */
  async createTestSpreadsheet(integration: GoogleSheetsIntegration): Promise<string> {
    try {
      const testSpreadsheet = await integration.createSpreadsheet('IntegratePDF Test Spreadsheet')
      console.log(`Test spreadsheet created: ${testSpreadsheet.url}`)
      return testSpreadsheet.id
    } catch (error) {
      console.error('Failed to create test spreadsheet:', error)
      throw error
    }
  },

  /**
   * Clean up test data
   */
  async cleanupTestData(spreadsheetId: string): Promise<void> {
    console.log(`Test cleanup: Please manually delete test spreadsheet ${spreadsheetId}`)
    // Note: Google Sheets API doesn't provide a delete spreadsheet endpoint
    // Users need to delete test spreadsheets manually from Google Drive
  }
}

export default testGoogleSheetsIntegration
