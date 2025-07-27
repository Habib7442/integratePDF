import { ExtractedField } from '@/stores/types'

export interface IntegrationTestResult {
  success: boolean
  error?: string
  details?: {
    connection: boolean
    authentication: boolean
    permissions: boolean
    dataValidation: boolean
  }
  suggestions?: string[]
}

export class IntegrationTester {
  static async testNotionIntegration(
    apiKey: string,
    databaseId?: string
  ): Promise<IntegrationTestResult> {
    const result: IntegrationTestResult = {
      success: false,
      details: {
        connection: false,
        authentication: false,
        permissions: false,
        dataValidation: false
      },
      suggestions: []
    }

    try {
      // Use our API endpoint to test the integration (avoids CORS issues)
      const response = await fetch('/api/integrations/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'notion',
          config: {
            api_key: apiKey,
            database_id: databaseId
          }
        })
      })

      const testResult = await response.json()

      if (response.ok && testResult.success) {
        result.success = true
        result.details = testResult.details
        result.suggestions = testResult.suggestions || ['Integration is ready to use!']
      } else {
        result.error = testResult.error || 'Connection test failed'
        result.suggestions = testResult.suggestions || []

        // Provide additional context based on status code
        if (response.status === 401) {
          result.suggestions.push('Check that your API key is correct and starts with "secret_"')
          result.suggestions.push('Ensure your integration has been created in Notion')
        } else if (response.status === 404) {
          result.suggestions.push('Check that the database ID is correct')
          result.suggestions.push('Ensure the database is shared with your integration')
          result.suggestions.push('Verify the database exists and is not deleted')
        } else if (response.status === 403) {
          result.suggestions.push('Share the database with your integration in Notion')
          result.suggestions.push('Check that your integration has the correct permissions')
        }
      }

      return result
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error occurred'
      result.suggestions?.push('Check your internet connection')
      result.suggestions?.push('Verify that your API key is valid')
      return result
    }
  }

  static validateExtractedDataForNotion(
    extractedData: ExtractedField[],
    notionProperties: Record<string, any>
  ): { valid: boolean; issues: string[]; suggestions: string[] } {
    const issues: string[] = []
    const suggestions: string[] = []

    // Check if we have any data to push
    if (extractedData.length === 0) {
      issues.push('No extracted data to push')
      return { valid: false, issues, suggestions }
    }

    // Check for common field mappings
    const extractedFieldNames = extractedData.map(f => f.field_key.toLowerCase())
    const notionPropertyNames = Object.keys(notionProperties).map(p => p.toLowerCase())

    const commonMappings = [
      { extracted: ['title', 'name'], notion: ['title', 'name'] },
      { extracted: ['amount', 'total', 'price'], notion: ['amount', 'total', 'price'] },
      { extracted: ['date'], notion: ['date', 'created', 'due'] },
      { extracted: ['description', 'notes'], notion: ['description', 'notes', 'details'] }
    ]

    let mappingCount = 0
    for (const mapping of commonMappings) {
      const hasExtracted = mapping.extracted.some(e => 
        extractedFieldNames.some(f => f.includes(e))
      )
      const hasNotion = mapping.notion.some(n => 
        notionPropertyNames.some(p => p.includes(n))
      )
      
      if (hasExtracted && hasNotion) {
        mappingCount++
      }
    }

    if (mappingCount === 0) {
      suggestions.push('Consider adding common properties like Title, Amount, or Date to your Notion database')
      suggestions.push('Field names that match extracted data will be automatically mapped')
    }

    // Check for data type compatibility
    for (const field of extractedData) {
      if (field.confidence < 0.5) {
        suggestions.push(`Consider reviewing the value for "${field.field_key}" (low confidence: ${Math.round(field.confidence * 100)}%)`)
      }
    }

    return {
      valid: true,
      issues,
      suggestions
    }
  }

  static generateFieldMappingSuggestions(
    extractedData: ExtractedField[],
    notionProperties: Record<string, any>
  ): Record<string, string> {
    const suggestions: Record<string, string> = {}

    for (const field of extractedData) {
      const fieldKey = field.field_key.toLowerCase()
      
      // Find best matching Notion property
      for (const [propName, prop] of Object.entries(notionProperties)) {
        const propNameLower = propName.toLowerCase()
        
        // Exact match
        if (fieldKey === propNameLower) {
          suggestions[field.field_key] = propName
          break
        }
        
        // Partial match
        if (fieldKey.includes(propNameLower) || propNameLower.includes(fieldKey)) {
          suggestions[field.field_key] = propName
          break
        }
        
        // Semantic matching
        const semanticMappings = [
          { keywords: ['total', 'amount', 'price', 'cost'], types: ['number'] },
          { keywords: ['date', 'time', 'due', 'created'], types: ['date'] },
          { keywords: ['name', 'title', 'subject'], types: ['title', 'rich_text'] },
          { keywords: ['description', 'notes', 'details', 'comment'], types: ['rich_text'] },
          { keywords: ['email', 'mail'], types: ['email'] },
          { keywords: ['phone', 'tel', 'mobile'], types: ['phone_number'] },
          { keywords: ['url', 'link', 'website'], types: ['url'] },
          { keywords: ['status', 'state', 'stage'], types: ['select'] }
        ]

        for (const mapping of semanticMappings) {
          const fieldMatches = mapping.keywords.some(keyword => fieldKey.includes(keyword))
          const propMatches = mapping.types.includes(prop.type) || 
                             mapping.keywords.some(keyword => propNameLower.includes(keyword))
          
          if (fieldMatches && propMatches) {
            suggestions[field.field_key] = propName
            break
          }
        }
        
        if (suggestions[field.field_key]) break
      }
    }

    return suggestions
  }
}
