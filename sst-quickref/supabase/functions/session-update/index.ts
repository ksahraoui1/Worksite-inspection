/**
 * Edge Function session-update — Met à jour le session_id actif d'un abonné
 * Appelé à chaque login pour écraser l'ancienne session
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const { email, session_id } = await req.json()

    if (!email || !session_id) {
      return new Response(JSON.stringify({ error: 'email and session_id required' }), { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error } = await supabase
      .from('subscriptions')
      .update({ active_session_id: session_id, updated_at: new Date().toISOString() })
      .eq('email', email)

    if (error) {
      console.error('Session update error:', error)
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Session update error:', error)
    return new Response(JSON.stringify({ error: 'internal error' }), { status: 500 })
  }
})
