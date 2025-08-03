import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { ExtractedField } from '@/stores/types'
import { IntegrationErrorHandler } from './error-handler'
import { decryptApiKey, isEncrypted } from '@/lib/encryption'

export interface GoogleSheetsConfig {
  spreadsheet_id: string
  sheet_name?: string
  access_token: string
  refresh_token: string
  client_id: string
  client_secret: string
}

export interface GoogleSheetsSpreadsheet {
  id: string
  name: string
  url: string
  sheets: GoogleSheetsSheet[]
}

export interface GoogleSheetsSheet {
  id: number
  title: string
  index: number
  rowCount: number
  columnCount: number
}

export interface GoogleSheetsRange {
  range: string
  majorDimension: 'ROWS' | 'COLUMNS'
  values: string[][]
}

export class GoogleSheetsIntegration {
  private config: GoogleSheetsConfig
  private auth: OAuth2Client
  private sheets: any

  constructor(config: GoogleSheetsConfig) {
    // Decrypt sensitive data if encrypted
    this.config = {
      ...config,
      access_token: isEncrypted(config.access_token) ? decryptApiKey(config.access_token) : config.access_token,
      refresh_token: isEncrypted(config.refresh_token) ? decryptApiKey(config.refresh_token) : config.refresh_token,
      client_secret: isEncrypted(config.client_secret) ? decryptApiKey(config.client_secret) : config.client_secret,
    }

    // Initialize OAuth2 client
    this.auth = new OAuth2Client(
      this.config.client_id,
      this.config.client_secret,
      process.env.GOOGLE_REDIRECT_URI
    )

    // Set credentials
    this.auth.setCredentials({
      access_token: this.config.access_token,
      refresh_token: this.config.refresh_token,
    })

    // Initialize Google Sheets API
    this.sheets = google.sheets({ version: 'v4', auth: this.auth })
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const { credentials } = await this.auth.refreshAccessToken()

      if (credentials.access_token) {
        this.config.access_token = credentials.access_token
        this.auth.setCredentials(credentials)
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to refresh Google access token:', error)
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getSpreadsheet(this.config.spreadsheet_id)
      return true
    } catch (error) {
      console.error('Google Sheets connection test failed:', error)
      return false
    }
  }

  async getSpreadsheet(spreadsheetId: string): Promise<GoogleSheetsSpreadsheet> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: false
      })

      const spreadsheet = response.data

      return {
        id: spreadsheet.spreadsheetId!,
        name: spreadsheet.properties!.title!,
        url: spreadsheet.spreadsheetUrl!,
        sheets: spreadsheet.sheets!.map((sheet: any) => ({
          id: sheet.properties.sheetId,
          title: sheet.properties.title,
          index: sheet.properties.index,
          rowCount: sheet.properties.gridProperties?.rowCount || 1000,
          columnCount: sheet.properties.gridProperties?.columnCount || 26,
        }))
      }
    } catch (error: any) {
      const integrationError = IntegrationErrorHandler.handleGoogleSheetsError({
        status: error.code || 500,
        message: error.message || 'Failed to fetch spreadsheet'
      })
      throw integrationError
    }
  }

  async getSheetData(spreadsheetId: string, range: string): Promise<GoogleSheetsRange> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      })

      return {
        range: response.data.range!,
        majorDimension: response.data.majorDimension as 'ROWS' | 'COLUMNS' || 'ROWS',
        values: response.data.values || []
      }
    } catch (error: any) {
      const integrationError = IntegrationErrorHandler.handleGoogleSheetsError({
        status: error.code || 500,
        message: error.message || 'Failed to fetch sheet data'
      })
      throw integrationError
    }
  }

  async appendData(spreadsheetId: string, range: string, values: string[][]): Promise<any> {
    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: values
        }
      })

      console.log('Data appended to Google Sheets successfully')
      return response.data
    } catch (error: any) {
      console.error('Error appending data to Google Sheets:', error)
      const integrationError = IntegrationErrorHandler.handleGoogleSheetsError({
        status: error.code || 500,
        message: error.message || 'Failed to append data'
      })
      throw integrationError
    }
  }

  async createSpreadsheet(title: string): Promise<GoogleSheetsSpreadsheet> {
    try {
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: title
          }
        }
      })

      const spreadsheet = response.data

      return {
        id: spreadsheet.spreadsheetId!,
        name: spreadsheet.properties!.title!,
        url: spreadsheet.spreadsheetUrl!,
        sheets: spreadsheet.sheets!.map((sheet: any) => ({
          id: sheet.properties.sheetId,
          title: sheet.properties.title,
          index: sheet.properties.index,
          rowCount: sheet.properties.gridProperties?.rowCount || 1000,
          columnCount: sheet.properties.gridProperties?.columnCount || 26,
        }))
      }
    } catch (error: any) {
      const integrationError = IntegrationErrorHandler.handleGoogleSheetsError({
        status: error.code || 500,
        message: error.message || 'Failed to create spreadsheet'
      })
      throw integrationError
    }
  }

  async pushExtractedData(
    extractedData: ExtractedField[],
    mapping: Record<string, string>,
    options: {
      spreadsheetId?: string
      sheetName?: string
      createHeaders?: boolean
      documentName?: string
    } = {}
  ): Promise<any> {
    try {
      let spreadsheetId = options.spreadsheetId || this.config.spreadsheet_id
      const sheetName = options.sheetName || this.config.sheet_name || 'Sheet1'

      console.log('Google Sheets push - spreadsheetId:', spreadsheetId)
      console.log('Google Sheets push - sheetName:', sheetName)
      console.log('Google Sheets push - extractedData length:', extractedData.length)

      // Create new spreadsheet if none provided
      if (!spreadsheetId) {
        console.log('No spreadsheet ID provided, creating new spreadsheet...')
        const documentName = options.documentName || 'IntegratePDF Data'
        const newSpreadsheet = await this.createSpreadsheet(`${documentName} - ${new Date().toLocaleDateString()}`)
        spreadsheetId = newSpreadsheet.id
        console.log('Created new spreadsheet:', spreadsheetId)
      }

      // Get current spreadsheet info
      console.log('Getting spreadsheet info...')
      const spreadsheet = await this.getSpreadsheet(spreadsheetId)
      const targetSheet = spreadsheet.sheets.find(s => s.title === sheetName) || spreadsheet.sheets[0]
      
      if (!targetSheet) {
        throw new Error(`Sheet "${sheetName}" not found`)
      }

      // Prepare the data row
      const headers: string[] = []
      const values: string[] = []

      // If mapping is provided, use it; otherwise use field keys as headers
      if (Object.keys(mapping).length > 0) {
        for (const field of extractedData) {
          const columnName = mapping[field.field_key]
          if (columnName) {
            headers.push(columnName)
            values.push(field.field_value)
          }
        }
      } else {
        // Auto-generate headers from field keys
        for (const field of extractedData) {
          headers.push(this.formatFieldKeyAsHeader(field.field_key))
          values.push(field.field_value)
        }
      }

      // Check if we need to add headers (first row)
      const range = `${targetSheet.title}!A:Z`
      const existingData = await this.getSheetData(spreadsheetId, range)
      
      const dataToAppend: string[][] = []
      
      if (options.createHeaders && existingData.values.length === 0) {
        // Add headers as first row
        dataToAppend.push(headers)
      }
      
      // Add the data row
      dataToAppend.push(values)

      // Append the data
      const appendRange = `${targetSheet.title}!A:A`
      const result = await this.appendData(spreadsheetId, appendRange, dataToAppend)

      // Return result with spreadsheet info
      return {
        ...result,
        spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        sheetName: targetSheet.title
      }
    } catch (error) {
      console.error('Google Sheets push error details:', error)
      throw new Error(`Failed to push data to Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private formatFieldKeyAsHeader(fieldKey: string): string {
    // Convert field_key to "Field Key" format
    return fieldKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Helper method to get suggested field mappings
  static suggestMappings(
    extractedFields: ExtractedField[],
    existingHeaders: string[]
  ): Record<string, string> {
    const mappings: Record<string, string> = {}
    
    for (const field of extractedFields) {
      const fieldKey = field.field_key.toLowerCase()
      
      // Find best matching header
      for (const header of existingHeaders) {
        const headerLower = header.toLowerCase()
        
        // Exact match
        if (fieldKey === headerLower) {
          mappings[field.field_key] = header
          break
        }
        
        // Partial match
        if (fieldKey.includes(headerLower) || headerLower.includes(fieldKey)) {
          mappings[field.field_key] = header
          break
        }
        
        // Common field mappings
        if (
          (fieldKey.includes('total') || fieldKey.includes('amount')) && 
          (headerLower.includes('total') || headerLower.includes('amount') || headerLower.includes('price'))
        ) {
          mappings[field.field_key] = header
          break
        }
        
        if (
          fieldKey.includes('date') && 
          headerLower.includes('date')
        ) {
          mappings[field.field_key] = header
          break
        }
        
        if (
          (fieldKey.includes('name') || fieldKey.includes('title')) && 
          (headerLower.includes('name') || headerLower.includes('title'))
        ) {
          mappings[field.field_key] = header
          break
        }
      }
    }
    
    return mappings
  }
}
