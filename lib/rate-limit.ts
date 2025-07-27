/**
 * Rate limiting utilities for API endpoints
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: Request) => string // Custom key generator
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Default key generator using IP address
 */
function defaultKeyGenerator(request: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown'
  return `rate_limit:${ip}`
}

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Rate limiting function
 */
export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator = defaultKeyGenerator } = config

  return function checkRateLimit(request: Request): {
    allowed: boolean
    limit: number
    remaining: number
    resetTime: number
    retryAfter?: number
  } {
    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to cleanup
      cleanupExpiredEntries()
    }

    const key = keyGenerator(request)
    const now = Date.now()
    const resetTime = now + windowMs

    let entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime
      }
      rateLimitStore.set(key, entry)

      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetTime
      }
    }

    // Increment count
    entry.count++

    if (entry.count > maxRequests) {
      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }
    }

    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }
}

/**
 * Predefined rate limit configurations
 */
export const rateLimitConfigs = {
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100 // 100 requests per 15 minutes
  },
  
  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20 // 20 uploads per hour
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 auth attempts per 15 minutes
  },
  
  // Integration test endpoints
  integration: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10 // 10 tests per 5 minutes
  }
}

/**
 * Rate limit middleware for API routes
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const checkLimit = rateLimit(config)

  return function rateLimitMiddleware(request: Request): Response | null {
    const result = checkLimit(request)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            'Retry-After': result.retryAfter?.toString() || '60'
          }
        }
      )
    }

    // Add rate limit headers to successful responses
    return null // Continue processing
  }
}

/**
 * User-specific rate limiting (requires authentication)
 */
export function createUserRateLimit(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: (request: Request) => {
      // This would need to be called after authentication
      // For now, fall back to IP-based limiting
      return defaultKeyGenerator(request)
    }
  })
}
