interface StructuredDataProps {
  data: Record<string, any>
}

/**
 * Safe structured data component that prevents XSS attacks
 * by validating and sanitizing JSON-LD data before rendering
 */
export function StructuredData({ data }: StructuredDataProps) {
  try {
    // Validate that data is a plain object
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      console.warn('StructuredData: Invalid data provided')
      return null
    }

    // Convert to JSON string with proper escaping
    const jsonString = JSON.stringify(data, (key, value) => {
      // Sanitize string values to prevent XSS
      if (typeof value === 'string') {
        return value
          .replace(/</g, '\\u003c')
          .replace(/>/g, '\\u003e')
          .replace(/&/g, '\\u0026')
          .replace(/'/g, '\\u0027')
          .replace(/"/g, '\\u0022')
      }
      return value
    }, 0)

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('StructuredData: Failed to serialize data', error)
    return null
  }
}

// Static structured data for the application
export const APP_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "IntegratePDF",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "AI-powered PDF data extraction and integration platform that transforms PDFs into structured data and seamlessly integrates with business tools like Notion.",
  "url": "https://integratepdf.com",
  "author": {
    "@type": "Organization",
    "name": "IntegratePDF"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free plan with 10 PDFs per month"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "200",
    "bestRating": "5"
  },
  "featureList": [
    "AI-powered PDF data extraction",
    "Notion database integration",
    "CSV export functionality",
    "95% accuracy rate",
    "Batch processing",
    "API access",
    "Enterprise security"
  ]
} as const
