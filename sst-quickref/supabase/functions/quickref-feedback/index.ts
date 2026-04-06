/**
 * T040: Feedback Edge Function
 * Accepts user feedback (thumbs up/down) for quickref query responses.
 * POST { query_id, rating } -> 201 on success
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      { error: 'method_not_allowed', message: 'Only POST is accepted' },
      405
    )
  }

  try {
    const body = await req.json()

    // Validate query_id
    if (!body.query_id || typeof body.query_id !== 'string') {
      return jsonResponse(
        { error: 'bad_request', message: 'Le champ "query_id" est requis.' },
        400
      )
    }

    if (!UUID_REGEX.test(body.query_id)) {
      return jsonResponse(
        { error: 'bad_request', message: 'Le champ "query_id" doit être un UUID valide.' },
        400
      )
    }

    // Validate rating
    if (!body.rating || (body.rating !== 'up' && body.rating !== 'down')) {
      return jsonResponse(
        { error: 'bad_request', message: 'Le champ "rating" doit être "up" ou "down".' },
        400
      )
    }

    // Insert feedback via service role client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error } = await supabase.from('quickref_feedback').insert({
      query_id: body.query_id,
      rating: body.rating,
    })

    if (error) {
      // Unique constraint violation = duplicate feedback
      if (error.code === '23505') {
        return jsonResponse(
          { error: 'conflict', message: 'Un feedback existe déjà pour cette requête.' },
          409
        )
      }

      // Foreign key violation = query_id doesn't exist
      if (error.code === '23503') {
        return jsonResponse(
          { error: 'bad_request', message: 'La requête référencée n\'existe pas.' },
          400
        )
      }

      console.error('Feedback insert error:', error)
      return jsonResponse(
        { error: 'internal_error', message: 'Erreur lors de l\'enregistrement du feedback.' },
        500
      )
    }

    return jsonResponse({ success: true, message: 'Feedback enregistré.' }, 201)
  } catch (err) {
    console.error('Unexpected error:', err)
    return jsonResponse(
      { error: 'bad_request', message: 'Corps de requête invalide.' },
      400
    )
  }
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}
