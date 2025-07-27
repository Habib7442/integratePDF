/**
 * Security headers configuration for enhanced protection
 */

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: boolean
  strictTransportSecurity?: boolean
  xFrameOptions?: boolean
  xContentTypeOptions?: boolean
  referrerPolicy?: boolean
  permissionsPolicy?: boolean
}

/**
 * Default security headers configuration
 */
const defaultConfig: Required<SecurityHeadersConfig> = {
  contentSecurityPolicy: true,
  strictTransportSecurity: true,
  xFrameOptions: true,
  xContentTypeOptions: true,
  referrerPolicy: true,
  permissionsPolicy: true
}

/**
 * Content Security Policy configuration
 */
function getCSPHeader(): string {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.com https://challenges.cloudflare.com https://js.sentry-cdn.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://*.supabase.co https://clerk.com https://*.clerk.com https://api.notion.com https://generativelanguage.googleapis.com https://*.sentry.io wss://*.supabase.co",
    "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.com",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ]

  return cspDirectives.join('; ')
}

/**
 * Permissions Policy configuration
 */
function getPermissionsPolicyHeader(): string {
  const policies = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'bluetooth=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ]

  return policies.join(', ')
}

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(
  response: Response,
  config: SecurityHeadersConfig = {}
): Response {
  const finalConfig = { ...defaultConfig, ...config }
  const headers = new Headers(response.headers)

  // Content Security Policy
  if (finalConfig.contentSecurityPolicy) {
    headers.set('Content-Security-Policy', getCSPHeader())
  }

  // Strict Transport Security (HTTPS only)
  if (finalConfig.strictTransportSecurity) {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // X-Frame-Options
  if (finalConfig.xFrameOptions) {
    headers.set('X-Frame-Options', 'DENY')
  }

  // X-Content-Type-Options
  if (finalConfig.xContentTypeOptions) {
    headers.set('X-Content-Type-Options', 'nosniff')
  }

  // Referrer Policy
  if (finalConfig.referrerPolicy) {
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  // Permissions Policy
  if (finalConfig.permissionsPolicy) {
    headers.set('Permissions-Policy', getPermissionsPolicyHeader())
  }

  // Additional security headers
  headers.set('X-DNS-Prefetch-Control', 'off')
  headers.set('X-Download-Options', 'noopen')
  headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none')
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  headers.set('Cross-Origin-Resource-Policy', 'same-origin')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}

/**
 * Create security headers for Next.js middleware
 */
export function createSecurityHeaders(config: SecurityHeadersConfig = {}): Record<string, string> {
  const finalConfig = { ...defaultConfig, ...config }
  const headers: Record<string, string> = {}

  if (finalConfig.contentSecurityPolicy) {
    headers['Content-Security-Policy'] = getCSPHeader()
  }

  if (finalConfig.strictTransportSecurity) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }

  if (finalConfig.xFrameOptions) {
    headers['X-Frame-Options'] = 'DENY'
  }

  if (finalConfig.xContentTypeOptions) {
    headers['X-Content-Type-Options'] = 'nosniff'
  }

  if (finalConfig.referrerPolicy) {
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
  }

  if (finalConfig.permissionsPolicy) {
    headers['Permissions-Policy'] = getPermissionsPolicyHeader()
  }

  // Additional headers
  headers['X-DNS-Prefetch-Control'] = 'off'
  headers['X-Download-Options'] = 'noopen'
  headers['X-Permitted-Cross-Domain-Policies'] = 'none'
  headers['Cross-Origin-Embedder-Policy'] = 'unsafe-none'
  headers['Cross-Origin-Opener-Policy'] = 'same-origin'
  headers['Cross-Origin-Resource-Policy'] = 'same-origin'

  return headers
}

/**
 * Security headers middleware for API routes
 */
export function securityHeadersMiddleware(
  request: Request,
  config: SecurityHeadersConfig = {}
): Record<string, string> {
  return createSecurityHeaders(config)
}
