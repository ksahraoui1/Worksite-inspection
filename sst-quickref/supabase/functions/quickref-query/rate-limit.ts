/**
 * T031: Rate limiting for quickref-query
 * In-memory rate limiter with TTL.
 * Anonymous: 10 requests/day per IP.
 * Authenticated: bypass rate limiting.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const ANONYMOUS_LIMIT = 10
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

const rateLimitMap = new Map<string, RateLimitEntry>()

/**
 * Checks whether a request is allowed under rate limits.
 * Authenticated users always pass. Anonymous users get 10 req/day per IP.
 */
export function checkRateLimit(
  ip: string,
  isAuthenticated: boolean
): { allowed: boolean; remaining: number; resetAt: number } {
  // Authenticated users bypass rate limiting
  if (isAuthenticated) {
    return { allowed: true, remaining: Infinity, resetAt: 0 }
  }

  cleanupExpiredEntries()

  const now = Date.now()
  const existing = rateLimitMap.get(ip)

  // No existing entry — create one
  if (!existing || now >= existing.resetAt) {
    const resetAt = now + WINDOW_MS
    rateLimitMap.set(ip, { count: 1, resetAt })
    return { allowed: true, remaining: ANONYMOUS_LIMIT - 1, resetAt }
  }

  // Existing entry within window
  if (existing.count >= ANONYMOUS_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count++
  const remaining = ANONYMOUS_LIMIT - existing.count
  return { allowed: true, remaining, resetAt: existing.resetAt }
}

/**
 * Removes expired entries to prevent memory leaks.
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap) {
    if (now >= entry.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}
