/**
 * T012: Shared types — Types TypeScript correspondant au contrat API
 */

export interface QuickRefSource {
  source: string
  article: string
  version_date: string
  source_url: string
  excerpt: string
}

export interface QuickRefResponse {
  query_id: string
  answer: string | null
  sources: QuickRefSource[]
  similarity_score: number
  disclaimer: string
  response_ms: number
  refused?: boolean
  refused_reason?: string
  fallback_url?: string
}

export interface QuickRefRateLimitError {
  error: 'rate_limit_exceeded'
  message: string
  retry_after: number
}

export interface QuickRefError {
  error: string
  message: string
}

export interface QuickRefQuery {
  question: string
  context?: {
    theme?: string
    category?: string
  }
  language?: string
}

export interface QuickRefFeedback {
  query_id: string
  rating: 'up' | 'down'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: QuickRefSource[]
  query_id?: string
  refused?: boolean
  refused_reason?: string
  timestamp: Date
}
