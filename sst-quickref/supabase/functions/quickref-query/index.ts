/**
 * Edge Function quickref-query — Pipeline RAG sécurisé
 *
 * Corrections de sécurité appliquées :
 * - Tous les modules de sécurité connectés (validate, rate-limit, anonymize)
 * - CORS restreint à quickref.securionis.com
 * - Comparaison constant-time pour la clé admin
 * - Protection prompt injection (délimiteurs)
 * - Seuil de similarité au niveau RPC
 * - Client anon pour lectures, service role pour écritures seulement
 * - Anonymisation PII avant logging
 * - Limite taille requête
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { SYSTEM_PROMPT, DISCLAIMER_TEXT } from './system-prompt.ts'
import { validateRequest, type QuickRefRequest } from './validate.ts'
import { checkRateLimit } from './rate-limit.ts'
import { anonymizeQuestion } from './anonymize.ts'

const SIMILARITY_THRESHOLD = parseFloat(Deno.env.get('QUICKREF_SIMILARITY_THRESHOLD') ?? '0.55')
const TOP_K = parseInt(Deno.env.get('QUICKREF_TOP_K') ?? '5')
const MAX_REQUEST_BYTES = 10_240 // 10 KB

const ALLOWED_ORIGINS = [
  'https://quickref.securionis.com',
  'http://localhost:5173',
]

interface DocumentMatch {
  id: string
  content: string
  source: string
  article: string
  version_date: string
  source_url: string
  similarity: number
}

/**
 * Constant-time string comparison to prevent timing attacks on admin key.
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Build CORS headers restricted to allowed origins.
 */
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-admin-key',
    'Vary': 'Origin',
  }
}

function jsonResponse(body: unknown, corsHeaders: Record<string, string>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed', message: 'Only POST is accepted' }, corsHeaders, 405)
  }

  // Check request size
  const contentLength = parseInt(req.headers.get('Content-Length') ?? '0')
  if (contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: 'payload_too_large', message: 'Requête trop volumineuse.' }, corsHeaders, 413)
  }

  const startTime = Date.now()

  try {
    const rawBody = await req.json()

    // === VALIDATION (module validate.ts) ===
    const validation = validateRequest(rawBody)
    if (!validation.valid || !validation.parsed) {
      return jsonResponse({ error: 'bad_request', message: validation.error }, corsHeaders, 400)
    }
    const body = validation.parsed

    // === ADMIN CHECK (constant-time comparison) ===
    const adminKey = req.headers.get('x-admin-key') ?? ''
    const expectedKey = Deno.env.get('QUICKREF_ADMIN_KEY') ?? ''
    const isAdmin = adminKey.length > 0 && expectedKey.length > 0 && safeCompare(adminKey, expectedKey)

    // === RATE LIMITING (module rate-limit.ts) ===
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown'

    const rateCheck = checkRateLimit(clientIp, isAdmin)
    if (!rateCheck.allowed) {
      return jsonResponse({
        error: 'rate_limit_exceeded',
        message: 'Vous avez atteint la limite de 10 requêtes gratuites par jour. Utilisez une clé Pro pour un accès illimité.',
        retry_after: Math.ceil((rateCheck.resetAt - Date.now()) / 1000),
      }, {
        ...corsHeaders,
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(rateCheck.resetAt / 1000)),
      }, 429)
    }

    // Build search query
    const searchQuery = body.context?.theme && body.context?.category
      ? `${body.context.theme} ${body.context.category} ${body.question}`
      : body.question

    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(searchQuery)

    // === SEARCH with anon key (respects RLS) ===
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data: matches, error: searchError } = await supabaseAnon.rpc('match_documents_sst', {
      query_embedding: questionEmbedding,
      match_threshold: SIMILARITY_THRESHOLD,
      match_count: TOP_K,
    })

    if (searchError) {
      console.error('Search error:', searchError)
      return jsonResponse({ error: 'internal_error', message: 'Le service est temporairement indisponible.' }, corsHeaders, 500)
    }

    const topMatches: DocumentMatch[] = matches ?? []
    const topScore = topMatches.length > 0 ? topMatches[0].similarity : 0
    const queryId = crypto.randomUUID()

    // === LOGGING with service role key (bypasses RLS for INSERT) ===
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // === ANONYMIZE question before logging ===
    const anonymizedQuestion = anonymizeQuestion(body.question)
    const userType = isAdmin ? 'admin' : 'anonymous'

    // Check similarity threshold — refuse if no matches above threshold
    if (topMatches.length === 0) {
      await logQuery(supabaseService, queryId, anonymizedQuestion, [], Date.now() - startTime, userType, topScore, true)

      const responseHeaders = {
        ...corsHeaders,
        'X-RateLimit-Remaining': String(rateCheck.remaining),
      }

      return jsonResponse({
        query_id: queryId,
        answer: null,
        sources: [],
        similarity_score: topScore,
        refused: true,
        refused_reason: "Je n'ai pas trouvé de texte réglementaire sur ce sujet. Essayez de reformuler votre question.",
        disclaimer: DISCLAIMER_TEXT,
        response_ms: Date.now() - startTime,
      }, responseHeaders)
    }

    // Build context for Claude with prompt injection protection
    const context = topMatches
      .map((m) => `[${m.source}] ${m.article} (Version ${m.version_date}):\n${m.content}`)
      .join('\n\n---\n\n')

    // === GENERATE RESPONSE with prompt injection delimiters ===
    const answer = await generateClaudeResponse(body.question, context)

    // Build sources array
    const sources = topMatches.map((m) => ({
      source: m.source,
      article: m.article,
      version_date: m.version_date,
      source_url: m.source_url,
      excerpt: m.content.substring(0, 200) + (m.content.length > 200 ? '...' : ''),
    }))

    const sourcesUsed = sources.map((s) => `${s.source}:${s.article}`)
    await logQuery(supabaseService, queryId, anonymizedQuestion, sourcesUsed, Date.now() - startTime, userType, topScore, false)

    const responseHeaders = {
      ...corsHeaders,
      'X-RateLimit-Remaining': String(rateCheck.remaining),
    }

    return jsonResponse({
      query_id: queryId,
      answer,
      sources,
      similarity_score: topScore,
      disclaimer: DISCLAIMER_TEXT,
      response_ms: Date.now() - startTime,
    }, responseHeaders)
  } catch (error) {
    console.error('Unexpected error:', error)
    return jsonResponse({
      error: 'internal_error',
      message: 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.',
    }, corsHeaders, 500)
  }
})

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI embedding error: ${response.status}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

async function generateClaudeResponse(question: string, context: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Contexte réglementaire :\n\n${context}\n\n---\n\n<user_question>${question}</user_question>`,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function logQuery(
  supabase: ReturnType<typeof createClient>,
  queryId: string,
  question: string,
  sourcesUsed: string[],
  responseMs: number,
  userType: string,
  similarityScore: number,
  wasRefused: boolean
): Promise<void> {
  try {
    await supabase.from('quickref_queries').insert({
      id: queryId,
      question,
      sources_used: sourcesUsed,
      response_ms: responseMs,
      user_type: userType,
      similarity_score: similarityScore,
      was_refused: wasRefused,
    })
  } catch (error) {
    console.error('Failed to log query:', error)
  }
}
