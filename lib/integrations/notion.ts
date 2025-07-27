import { ExtractedField } from '@/stores/types'
import { IntegrationErrorHandler } from './error-handler'
import { decryptApiKey, isEncrypted } from '@/lib/encryption'

export interface NotionDatabase {
  id: string
  title: string
  properties: Record<string, NotionProperty>
  url: string
}

export interface NotionProperty {
  id: string
  name: string
  type: string
  options?: Array<{ id: string; name: string; color?: string }>
}

export interface NotionPageData {
  properties: Record<string, any>
}

export class NotionIntegration {
  private apiKey: string
  private baseUrl = 'https://api.notion.com/v1'

  constructor(apiKey: string) {
    // Decrypt API key if it's encrypted, otherwise use as-is (for backward compatibility)
    this.apiKey = isEncrypted(apiKey) ? decryptApiKey(apiKey) : apiKey
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      const integrationError = IntegrationErrorHandler.handleNotionError({
        status: response.status,
        message: error.message || response.statusText
      })
      throw integrationError
    }

    return response.json()
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/users/me')
      return true
    } catch (error) {
      console.error('Notion connection test failed:', error)
      return false
    }
  }

  async getDatabase(databaseId: string): Promise<NotionDatabase> {
    try {
      const response = await this.makeRequest(`/databases/${databaseId}`)
      
      return {
        id: response.id,
        title: response.title?.[0]?.plain_text || 'Untitled Database',
        properties: this.parseProperties(response.properties),
        url: response.url
      }
    } catch (error) {
      throw new Error(`Failed to fetch database: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async queryDatabase(databaseId: string, filter?: any): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/databases/${databaseId}/query`, {
        method: 'POST',
        body: JSON.stringify({ filter })
      })
      
      return response.results
    } catch (error) {
      throw new Error(`Failed to query database: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createPage(databaseId: string, properties: Record<string, any>): Promise<any> {
    try {
      const payload = {
        parent: { database_id: databaseId },
        properties: this.formatPropertiesForCreation(properties)
      }

      console.log('Creating Notion page with payload:', JSON.stringify(payload, null, 2))

      const response = await this.makeRequest('/pages', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      console.log('Notion page created successfully:', response.id)
      return response
    } catch (error) {
      console.error('Error creating Notion page:', error)
      throw new Error(`Failed to create page: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async pushExtractedData(
    databaseId: string,
    extractedData: ExtractedField[],
    mapping: Record<string, string>
  ): Promise<any> {
    try {
      // Get database schema to understand property types
      const database = await this.getDatabase(databaseId)

      // Transform extracted data according to mapping
      const properties: Record<string, any> = {}
      const usedProperties = new Set<string>()

      console.log('Available Notion properties:', Object.keys(database.properties))
      console.log('Extracted fields to map:', extractedData.map(f => `${f.field_key}: "${f.field_value}"`))

      // Log available options for option-based properties
      Object.entries(database.properties).forEach(([name, prop]) => {
        if (prop.options && prop.options.length > 0) {
          console.log(`${name} (${prop.type}) options:`, prop.options.map(o => o.name))
        }
      })

      for (const field of extractedData) {
        let notionPropertyName = mapping[field.field_key]

        // If no mapping provided, try to find a matching property automatically
        if (!notionPropertyName) {
          notionPropertyName = this.findMatchingProperty(field.field_key, database.properties)

          // Skip if this property is already used (avoid conflicts)
          if (notionPropertyName && usedProperties.has(notionPropertyName)) {
            console.log(`Skipping "${field.field_key}" -> "${notionPropertyName}" (already used)`)
            continue
          }

          if (notionPropertyName) {
            console.log(`Auto-mapped "${field.field_key}" -> "${notionPropertyName}"`)
            usedProperties.add(notionPropertyName)
          } else {
            console.log(`No mapping found for field: "${field.field_key}"`)
          }
        }

        if (!notionPropertyName) continue

        const notionProperty = database.properties[notionPropertyName]
        if (!notionProperty) continue

        // Format value according to Notion property type
        const formattedValue = this.formatValueForProperty(
          field.field_value,
          notionProperty.type,
          notionProperty.options
        )

        console.log(`Formatting "${field.field_key}" (${field.field_value}) for ${notionProperty.type}:`, formattedValue)

        // Validate that the formatted value matches the expected property type
        if (formattedValue && !this.validatePropertyValue(formattedValue, notionProperty.type)) {
          console.warn(`Warning: Formatted value for "${field.field_key}" may not match expected type "${notionProperty.type}"`)
        }

        if (formattedValue !== null) {
          properties[notionPropertyName] = formattedValue
        }
      }

      console.log('Final properties to create:', properties)

      // Ensure we have a title property (required by Notion)
      if (!properties.Title && !properties.title) {
        // Find the title property in the database
        const titleProperty = Object.entries(database.properties).find(([_, prop]) => prop.type === 'title')
        if (titleProperty) {
          const [titlePropName] = titleProperty
          properties[titlePropName] = {
            title: [{ text: { content: `Document ${new Date().toISOString().split('T')[0]}` } }]
          }
          console.log(`Added default title: ${titlePropName}`)
        }
      }

      // Create the page
      return await this.createPage(databaseId, properties)
    } catch (error) {
      throw new Error(`Failed to push data to Notion: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private findMatchingProperty(fieldKey: string, properties: Record<string, any>): string | null {
    const normalizedFieldKey = fieldKey.toLowerCase().replace(/[^a-z0-9]/g, '')
    const propertyNames = Object.keys(properties)

    // Define common field mappings
    const commonMappings: Record<string, string[]> = {
      'amount': ['total amount', 'amount', 'price', 'cost', 'sum', 'value'],
      'date': ['receipt date', 'date', 'created', 'timestamp'],
      'title': ['document name', 'title', 'name', 'filename'],
      'description': ['description', 'notes', 'details', 'memo'],
      'status': ['status', 'state', 'condition', 'payment status'],
      'category': ['category', 'type', 'class', 'document type'],
      'tags': ['tags', 'labels', 'keywords']
    }

    // First, try exact match (case-insensitive)
    for (const propName of propertyNames) {
      if (propName.toLowerCase() === fieldKey.toLowerCase()) {
        return propName
      }
    }

    // Then try common mappings
    for (const [notionProp, fieldVariants] of Object.entries(commonMappings)) {
      if (propertyNames.some(p => p.toLowerCase() === notionProp)) {
        for (const variant of fieldVariants) {
          if (fieldKey.toLowerCase().includes(variant) || variant.includes(fieldKey.toLowerCase())) {
            return propertyNames.find(p => p.toLowerCase() === notionProp) || null
          }
        }
      }
    }

    // Then try normalized match (remove spaces, special chars)
    for (const propName of propertyNames) {
      const normalizedPropName = propName.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (normalizedPropName === normalizedFieldKey) {
        return propName
      }
    }

    // Finally, try partial match
    for (const propName of propertyNames) {
      const normalizedPropName = propName.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (normalizedPropName.includes(normalizedFieldKey) || normalizedFieldKey.includes(normalizedPropName)) {
        return propName
      }
    }

    return null
  }

  private parseProperties(properties: Record<string, any>): Record<string, NotionProperty> {
    const parsed: Record<string, NotionProperty> = {}

    for (const [name, prop] of Object.entries(properties)) {
      const notionProperty: NotionProperty = {
        id: prop.id,
        name: name,
        type: prop.type
      }

      // Extract options for select and status properties
      if (prop.type === 'select' && prop.select?.options) {
        notionProperty.options = prop.select.options.map((option: any) => ({
          id: option.id,
          name: option.name,
          color: option.color
        }))
      } else if (prop.type === 'status' && prop.status?.options) {
        notionProperty.options = prop.status.options.map((option: any) => ({
          id: option.id,
          name: option.name,
          color: option.color
        }))
      } else if (prop.type === 'multi_select' && prop.multi_select?.options) {
        notionProperty.options = prop.multi_select.options.map((option: any) => ({
          id: option.id,
          name: option.name,
          color: option.color
        }))
      }

      parsed[name] = notionProperty
    }

    return parsed
  }

  private formatValueForProperty(value: string, propertyType: string, options?: Array<{ id: string; name: string; color?: string }>): any {
    switch (propertyType) {
      case 'title':
        return {
          title: [{ text: { content: value } }]
        }
      
      case 'rich_text':
        return {
          rich_text: [{ text: { content: value } }]
        }
      
      case 'number':
        // Clean the value by removing currency symbols and commas
        const cleanValue = value.replace(/[$,€£¥₹]/g, '').trim()
        const numValue = parseFloat(cleanValue)
        return isNaN(numValue) ? null : { number: numValue }
      
      case 'select':
        if (!value) return null

        // Check if the value matches an existing option
        if (options) {
          const matchingOption = this.findMatchingOption(value, options)
          if (matchingOption) {
            console.log(`Using existing select option: "${matchingOption.name}" for value "${value}"`)
            return { select: { name: matchingOption.name } }
          } else {
            console.warn(`Select option "${value}" not found. Available options:`, options.map(o => o.name))
            // Use the first available option as fallback
            if (options.length > 0) {
              console.log(`Falling back to first available option: "${options[0].name}"`)
              return { select: { name: options[0].name } }
            }
          }
        }

        return { select: { name: value } }

      case 'multi_select':
        if (!value) return null

        const values = value.split(',').map(v => v.trim())
        const validOptions: Array<{ name: string }> = []

        if (options) {
          for (const val of values) {
            const matchingOption = this.findMatchingOption(val, options)
            if (matchingOption) {
              validOptions.push({ name: matchingOption.name })
            } else {
              console.warn(`Multi-select option "${val}" not found. Available options:`, options.map(o => o.name))
            }
          }
        } else {
          // No options available, use values as-is
          validOptions.push(...values.map(v => ({ name: v })))
        }

        return { multi_select: validOptions }
      
      case 'date':
        // Try to parse date
        const date = new Date(value)
        return isNaN(date.getTime()) ? null : {
          date: { start: date.toISOString().split('T')[0] }
        }
      
      case 'checkbox':
        return {
          checkbox: value.toLowerCase() === 'true' || value.toLowerCase() === 'yes'
        }
      
      case 'url':
        return { url: value }
      
      case 'email':
        return { email: value }
      
      case 'phone_number':
        return { phone_number: value }

      case 'status':
        if (!value) return null

        // Check if the value matches an existing status option
        if (options) {
          const matchingOption = this.findMatchingOption(value, options)
          if (matchingOption) {
            console.log(`Using existing status option: "${matchingOption.name}" for value "${value}"`)
            return { status: { name: matchingOption.name } }
          } else {
            console.warn(`Status option "${value}" not found. Available options:`, options.map(o => o.name))
            // Try to find a reasonable fallback
            const fallbackOption = this.findStatusFallback(value, options)
            if (fallbackOption) {
              console.log(`Using fallback status option: "${fallbackOption.name}" for value "${value}"`)
              return { status: { name: fallbackOption.name } }
            } else if (options.length > 0) {
              console.log(`Using first available status option: "${options[0].name}" as last resort`)
              return { status: { name: options[0].name } }
            }
          }
        }

        return { status: { name: value } }

      case 'people':
        // For people properties, we'd need user IDs, so skip for now
        return null

      case 'files':
        // For file properties, we'd need file URLs, so skip for now
        return null

      case 'relation':
        // For relation properties, we'd need page IDs, so skip for now
        return null

      case 'formula':
        // Formula properties are read-only, so skip
        return null

      case 'rollup':
        // Rollup properties are read-only, so skip
        return null

      case 'created_time':
      case 'last_edited_time':
        // These are automatically managed by Notion, so skip
        return null

      case 'created_by':
      case 'last_edited_by':
        // These are automatically managed by Notion, so skip
        return null

      default:
        // Default to rich text for unknown types
        console.warn(`Unknown property type "${propertyType}", defaulting to rich_text`)
        return {
          rich_text: [{ text: { content: value } }]
        }
    }
  }

  private formatPropertiesForCreation(properties: Record<string, any>): Record<string, any> {
    // Properties are already formatted by formatValueForProperty
    return properties
  }

  private findMatchingOption(value: string, options: Array<{ id: string; name: string; color?: string }>): { id: string; name: string; color?: string } | null {
    if (!value || !options || options.length === 0) return null

    const normalizedValue = value.toLowerCase().trim()

    // Exact match (case-insensitive)
    for (const option of options) {
      if (option.name.toLowerCase() === normalizedValue) {
        return option
      }
    }

    // Partial match
    for (const option of options) {
      if (option.name.toLowerCase().includes(normalizedValue) || normalizedValue.includes(option.name.toLowerCase())) {
        return option
      }
    }

    return null
  }

  private findStatusFallback(value: string, options: Array<{ id: string; name: string; color?: string }>): { id: string; name: string; color?: string } | null {
    if (!value || !options || options.length === 0) return null

    const normalizedValue = value.toLowerCase().trim()

    // Common status mappings
    const statusMappings: Record<string, string[]> = {
      'paid': ['paid', 'complete', 'completed', 'done', 'finished', 'success'],
      'pending': ['pending', 'in progress', 'processing', 'waiting'],
      'failed': ['failed', 'error', 'cancelled', 'rejected'],
      'draft': ['draft', 'new', 'created'],
      'active': ['active', 'open', 'current'],
      'inactive': ['inactive', 'closed', 'archived']
    }

    // Try to find a semantic match
    for (const [category, keywords] of Object.entries(statusMappings)) {
      if (keywords.some(keyword => normalizedValue.includes(keyword))) {
        // Look for an option that matches this category
        for (const option of options) {
          const optionName = option.name.toLowerCase()
          if (keywords.some(keyword => optionName.includes(keyword))) {
            return option
          }
        }
      }
    }

    return null
  }

  private validatePropertyValue(value: any, expectedType: string): boolean {
    if (!value || typeof value !== 'object') return false

    switch (expectedType) {
      case 'title':
        return value.title && Array.isArray(value.title)
      case 'rich_text':
        return value.rich_text && Array.isArray(value.rich_text)
      case 'number':
        return typeof value.number === 'number'
      case 'select':
        return value.select && typeof value.select.name === 'string'
      case 'multi_select':
        return value.multi_select && Array.isArray(value.multi_select)
      case 'date':
        return value.date && typeof value.date.start === 'string'
      case 'checkbox':
        return typeof value.checkbox === 'boolean'
      case 'url':
        return typeof value.url === 'string'
      case 'email':
        return typeof value.email === 'string'
      case 'phone_number':
        return typeof value.phone_number === 'string'
      case 'status':
        return value.status && typeof value.status.name === 'string'
      default:
        return true // Unknown types are allowed
    }
  }

  // Helper method to get suggested field mappings
  static suggestMappings(
    extractedFields: ExtractedField[],
    notionProperties: Record<string, NotionProperty>
  ): Record<string, string> {
    const mappings: Record<string, string> = {}
    
    for (const field of extractedFields) {
      const fieldKey = field.field_key.toLowerCase()
      
      // Find best matching Notion property
      for (const [propName, prop] of Object.entries(notionProperties)) {
        const propNameLower = propName.toLowerCase()
        
        // Exact match
        if (fieldKey === propNameLower) {
          mappings[field.field_key] = propName
          break
        }
        
        // Partial match
        if (fieldKey.includes(propNameLower) || propNameLower.includes(fieldKey)) {
          mappings[field.field_key] = propName
          break
        }
        
        // Common field mappings
        if (
          (fieldKey.includes('total') || fieldKey.includes('amount')) && 
          (propNameLower.includes('total') || propNameLower.includes('amount') || propNameLower.includes('price'))
        ) {
          mappings[field.field_key] = propName
          break
        }
        
        if (
          fieldKey.includes('date') && 
          (propNameLower.includes('date') || prop.type === 'date')
        ) {
          mappings[field.field_key] = propName
          break
        }
        
        if (
          (fieldKey.includes('name') || fieldKey.includes('title')) && 
          (prop.type === 'title' || propNameLower.includes('name') || propNameLower.includes('title'))
        ) {
          mappings[field.field_key] = propName
          break
        }
      }
    }
    
    return mappings
  }
}
