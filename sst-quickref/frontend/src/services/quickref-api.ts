/**
 * T029: Service API QuickRef
 * POST vers /api/quickref-query et /api/quickref-feedback
 */

import type {
  QuickRefQuery,
  QuickRefResponse,
  QuickRefFeedback,
  QuickRefRateLimitError,
  QuickRefError,
} from '@/types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// In dev mode, use Vite proxy (/api/). In production, call Supabase directly.
const API_BASE = import.meta.env.DEV
  ? '/api'
  : `${SUPABASE_URL}/functions/v1`

const API_HEADERS: Record<string, string> = import.meta.env.DEV
  ? { 'Content-Type': 'application/json' }
  : { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }

let lastRateLimitRemaining: number | null = null

function extractRateLimitHeader(response: Response): void {
  const remaining = response.headers.get('X-RateLimit-Remaining')
  if (remaining !== null) {
    lastRateLimitRemaining = parseInt(remaining, 10)
  }
}

export function getRateLimitRemaining(): number | null {
  return lastRateLimitRemaining
}

export async function sendQuestion(query: QuickRefQuery): Promise<QuickRefResponse> {
  const response = await fetch(`${API_BASE}/quickref-query`, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify(query),
  })

  extractRateLimitHeader(response)

  if (response.status === 429) {
    const rateLimitError: QuickRefRateLimitError = await response.json()
    throw new RateLimitError(rateLimitError.message, rateLimitError.retry_after)
  }

  if (!response.ok) {
    const errorBody: QuickRefError = await response.json()
    throw new ApiError(errorBody.error, errorBody.message)
  }

  return response.json()
}

export async function sendFeedback(feedback: QuickRefFeedback): Promise<void> {
  const response = await fetch(`${API_BASE}/quickref-feedback`, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify(feedback),
  })

  extractRateLimitHeader(response)

  if (!response.ok) {
    const errorBody: QuickRefError = await response.json()
    throw new ApiError(errorBody.error, errorBody.message)
  }
}

export class RateLimitError extends Error {
  retryAfter: number
  constructor(message: string, retryAfter: number) {
    super(message)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

export class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}
