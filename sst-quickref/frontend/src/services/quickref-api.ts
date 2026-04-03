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
  const response = await fetch('/api/quickref-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const response = await fetch('/api/quickref-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
