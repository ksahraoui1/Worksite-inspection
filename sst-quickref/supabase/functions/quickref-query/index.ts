/**
 * T017: Edge Function quickref-query — Pipeline RAG complet
 * Reçoit une question, calcule l'embedding, cherche dans pgvector,
 * vérifie le seuil de pertinence, génère une réponse Claude avec citations.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SYSTEM_PROMPT, DISCLAIMER_TEXT } from './system-prompt.ts'

const SIMILARITY_THRESHOLD = parseFloat(Deno.env.get('QUICKREF_SIMILARITY_THRESHOLD') ?? '0.75')
const TOP_K = parseInt(Deno.env.get('QUICKREF_TOP_K') ?? '5')

interface QuickRefRequest {
  question: string
  context?: {
    theme?: string
    category?: string
  }
  language?: string
}

interface DocumentMatch {
  id: string
  content: string
  source: string
  article: string
  version_date: string
  source_url: string
  similarity: number
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed', message: 'Only POST is accepted' }, 405)
  }

  const startTime = Date.now()

  try {
    const body: QuickRefRequest = await req.json()

    // Validate input
    if (!body.question || body.question.trim().length === 0) {
      return jsonResponse({ error: 'bad_request', message: 'Question is required' }, 400)
    }

    if (body.question.length > 500) {
      return jsonResponse({ error: 'bad_request', message: 'Question exceeds 500 characters' }, 400)
    }

    // Language check
    if (body.language && body.language !== 'fr') {
      return jsonResponse({
        error: 'unsupported_language',
        message: 'SST-QuickRef supporte uniquement le français pour le moment. Le support de l\'allemand est prévu prochainement.',
      }, 400)
    }

    // Build search query
    const searchQuery = buildSearchQuery(body)

    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(searchQuery)

    // Search pgvector for similar chunks
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: matches, error: searchError } = await supabase.rpc('match_documents_sst', {
      query_embedding: questionEmbedding,
      match_threshold: 0,
      match_count: TOP_K,
    })

    if (searchError) {
      console.error('Search error:', searchError)
      return jsonResponse({ error: 'internal_error', message: 'Le service est temporairement indisponible.' }, 500)
    }

    const topMatches: DocumentMatch[] = matches ?? []
    const topScore = topMatches.length > 0 ? topMatches[0].similarity : 0

    // Log query to quickref_queries
    const queryId = crypto.randomUUID()

    // Check similarity threshold — refuse if all below
    if (topScore < SIMILARITY_THRESHOLD) {
      await logQuery(supabase, queryId, body.question, [], Date.now() - startTime, 'anonymous', topScore, true)

      return jsonResponse({
        query_id: queryId,
        answer: null,
        sources: [],
        similarity_score: topScore,
        refused: true,
        refused_reason: 'Aucun texte réglementaire trouvé correspondant à votre question. Essayez de reformuler ou de préciser le texte de loi concerné.',
        disclaimer: DISCLAIMER_TEXT,
        response_ms: Date.now() - startTime,
      })
    }

    // Filter to only above-threshold matches
    const relevantMatches = topMatches.filter((m) => m.similarity >= SIMILARITY_THRESHOLD)

    // Build context for Claude
    const context = relevantMatches
      .map((m) => `[${m.source}] ${m.article} (Version ${m.version_date}):\n${m.content}`)
      .join('\n\n---\n\n')

    // Generate response with Claude
    const answer = await generateClaudeResponse(body.question, context)

    // Build sources array
    const sources = relevantMatches.map((m) => ({
      source: m.source,
      article: m.article,
      version_date: m.version_date,
      source_url: m.source_url,
      excerpt: m.content.substring(0, 200) + (m.content.length > 200 ? '...' : ''),
    }))

    const sourcesUsed = sources.map((s) => `${s.source}:${s.article}`)
    await logQuery(supabase, queryId, body.question, sourcesUsed, Date.now() - startTime, 'anonymous', topScore, false)

    return jsonResponse({
      query_id: queryId,
      answer,
      sources,
      similarity_score: topScore,
      disclaimer: DISCLAIMER_TEXT,
      response_ms: Date.now() - startTime,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return jsonResponse({
      error: 'internal_error',
      message: 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.',
    }, 500)
  }
})

function buildSearchQuery(body: QuickRefRequest): string {
  if (body.context?.theme && body.context?.category) {
    return `${body.context.theme} ${body.context.category} ${body.question}`
  }
  return body.question
}

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
          content: `Contexte réglementaire :\n\n${context}\n\n---\n\nQuestion : ${question}`,
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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
    },
  })
}
