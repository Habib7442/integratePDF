export interface IntegrationError {
  code: string
  message: string
  details?: any
  suggestions?: string[]
  retryable: boolean
}

export class IntegrationErrorHandler {
  static handleNotionError(error: any): IntegrationError {
    // Handle Notion API specific errors
    if (error.status) {
      switch (error.status) {
        case 400:
          return {
            code: 'NOTION_BAD_REQUEST',
            message: 'Invalid request to Notion API',
            details: error.message,
            suggestions: [
              'Check that all required fields are provided',
              'Verify that field values match the expected data types',
              'Ensure database ID is correctly formatted'
            ],
            retryable: false
          }

        case 401:
          return {
            code: 'NOTION_UNAUTHORIZED',
            message: 'Authentication failed with Notion',
            details: error.message,
            suggestions: [
              'Verify your API key is correct and starts with "secret_"',
              'Check that your integration is properly configured in Notion',
              'Ensure the API key has not expired'
            ],
            retryable: false
          }

        case 403:
          return {
            code: 'NOTION_FORBIDDEN',
            message: 'Permission denied to access Notion resource',
            details: error.message,
            suggestions: [
              'Share the database with your integration in Notion',
              'Check that your integration has the required permissions',
              'Verify the database exists and is accessible'
            ],
            retryable: false
          }

        case 404:
          return {
            code: 'NOTION_NOT_FOUND',
            message: 'Notion resource not found',
            details: error.message,
            suggestions: [
              'Check that the database ID is correct',
              'Verify the database has not been deleted',
              'Ensure the database is shared with your integration'
            ],
            retryable: false
          }

        case 409:
          return {
            code: 'NOTION_CONFLICT',
            message: 'Conflict with existing Notion data',
            details: error.message,
            suggestions: [
              'Check for duplicate entries',
              'Verify unique constraints are not violated',
              'Review the data being inserted'
            ],
            retryable: true
          }

        case 429:
          return {
            code: 'NOTION_RATE_LIMITED',
            message: 'Rate limit exceeded for Notion API',
            details: error.message,
            suggestions: [
              'Wait before retrying the request',
              'Reduce the frequency of API calls',
              'Consider implementing exponential backoff'
            ],
            retryable: true
          }

        case 500:
        case 502:
        case 503:
        case 504:
          return {
            code: 'NOTION_SERVER_ERROR',
            message: 'Notion server error',
            details: error.message,
            suggestions: [
              'Try again in a few moments',
              'Check Notion status page for service issues',
              'Contact support if the problem persists'
            ],
            retryable: true
          }

        default:
          return {
            code: 'NOTION_UNKNOWN_ERROR',
            message: `Notion API error: ${error.status}`,
            details: error.message,
            suggestions: [
              'Check the Notion API documentation',
              'Verify your request format',
              'Contact support if the issue persists'
            ],
            retryable: false
          }
      }
    }

    // Handle network and other errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        details: error.message,
        suggestions: [
          'Check your internet connection',
          'Verify that Notion API is accessible',
          'Try again in a few moments'
        ],
        retryable: true
      }
    }

    if (error.name === 'AbortError') {
      return {
        code: 'REQUEST_TIMEOUT',
        message: 'Request timed out',
        details: error.message,
        suggestions: [
          'Try again with a smaller data set',
          'Check your internet connection speed',
          'Contact support if timeouts persist'
        ],
        retryable: true
      }
    }

    // Generic error handling
    return {
      code: 'INTEGRATION_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error,
      suggestions: [
        'Try the operation again',
        'Check your integration configuration',
        'Contact support if the problem persists'
      ],
      retryable: true
    }
  }

  static handleAirtableError(error: any): IntegrationError {
    // TODO: Implement Airtable-specific error handling
    return {
      code: 'AIRTABLE_NOT_IMPLEMENTED',
      message: 'Airtable integration is not yet implemented',
      suggestions: ['Use Notion integration for now', 'Airtable support coming soon'],
      retryable: false
    }
  }

  static handleQuickBooksError(error: any): IntegrationError {
    // TODO: Implement QuickBooks-specific error handling
    return {
      code: 'QUICKBOOKS_NOT_IMPLEMENTED',
      message: 'QuickBooks integration is not yet implemented',
      suggestions: ['Use Notion integration for now', 'QuickBooks support coming soon'],
      retryable: false
    }
  }

  static getRetryDelay(attemptNumber: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000 // 1 second
    const maxDelay = 30000 // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay)
    const jitter = Math.random() * 0.1 * delay
    return delay + jitter
  }

  static shouldRetry(error: IntegrationError, attemptNumber: number): boolean {
    const maxRetries = 3
    return error.retryable && attemptNumber < maxRetries
  }

  static formatErrorForUser(error: IntegrationError): string {
    let message = error.message

    if (error.suggestions && error.suggestions.length > 0) {
      message += '\n\nSuggestions:\n'
      message += error.suggestions.map(s => `• ${s}`).join('\n')
    }

    return message
  }

  static logError(error: IntegrationError, context: any = {}) {
    console.error('Integration Error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      retryable: error.retryable,
      context
    })
  }
}
