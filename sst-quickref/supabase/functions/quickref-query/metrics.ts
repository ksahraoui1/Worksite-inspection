/**
 * T046: Observability metrics
 * Logs query metrics to quickref_queries table and console
 * for Supabase dashboard monitoring.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Logs query execution metrics to the quickref_queries table
 * and outputs structured logs for Supabase dashboard monitoring.
 *
 * @param supabase - Supabase service-role client
 * @param queryId - Unique query identifier
 * @param responseMs - Total response time in milliseconds
 * @param similarityScore - Top similarity score from pgvector search
 * @param wasRefused - Whether the query was refused (below threshold)
 * @param userType - User type: anonymous, inspector, or admin
 */
export async function logMetrics(
  supabase: ReturnType<typeof createClient>,
  queryId: string,
  responseMs: number,
  similarityScore: number,
  wasRefused: boolean,
  userType: string
): Promise<void> {
  // Structured console log for Supabase dashboard / log drain
  console.log(
    JSON.stringify({
      event: 'quickref_query_metric',
      query_id: queryId,
      response_ms: responseMs,
      similarity_score: similarityScore,
      was_refused: wasRefused,
      user_type: userType,
      timestamp: new Date().toISOString(),
    })
  )

  // Insert into quickref_queries for persistent storage
  try {
    const { error } = await supabase.from('quickref_queries').upsert(
      {
        id: queryId,
        response_ms: responseMs,
        similarity_score: similarityScore,
        was_refused: wasRefused,
        user_type: userType,
      },
      { onConflict: 'id' }
    )

    if (error) {
      console.error(
        JSON.stringify({
          event: 'quickref_metric_insert_error',
          query_id: queryId,
          error: error.message,
        })
      )
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'quickref_metric_insert_exception',
        query_id: queryId,
        error: String(err),
      })
    )
  }
}
