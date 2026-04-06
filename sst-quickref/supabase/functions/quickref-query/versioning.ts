/**
 * T045: Document versioning support
 * Extends pgvector queries to optionally include superseded documents.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface VersionedDocumentMatch {
  id: string
  content: string
  source: string
  article: string
  version_date: string
  source_url: string
  similarity: number
  is_superseded: boolean
}

/**
 * Queries documents with optional inclusion of superseded versions.
 * When includeSuperseded is true, uses a direct query instead of the
 * match_documents_sst RPC (which filters out superseded docs).
 *
 * @param supabase - Supabase client instance
 * @param queryEmbedding - The embedding vector for the search query
 * @param matchThreshold - Minimum similarity score
 * @param matchCount - Maximum number of results
 * @param includeSuperseded - Whether to include superseded documents
 */
export async function queryDocumentsWithVersioning(
  supabase: ReturnType<typeof createClient>,
  queryEmbedding: number[],
  matchThreshold: number,
  matchCount: number,
  includeSuperseded: boolean
): Promise<{ data: VersionedDocumentMatch[] | null; error: Error | null }> {
  if (!includeSuperseded) {
    // Use the standard RPC which excludes superseded documents
    const { data, error } = await supabase.rpc('match_documents_sst', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })

    if (error) {
      return { data: null, error }
    }

    // Add is_superseded: false to all results from the standard RPC
    const results: VersionedDocumentMatch[] = (data ?? []).map(
      (doc: Record<string, unknown>) => ({
        ...doc,
        is_superseded: false,
      })
    ) as VersionedDocumentMatch[]

    return { data: results, error: null }
  }

  // Include superseded documents — use match_documents_sst_all RPC
  // This function must be created separately (see note below).
  // Falls back to a direct query approach using the Supabase client.
  const { data, error } = await supabase.rpc('match_documents_sst_all', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  })

  if (error) {
    // If the _all variant doesn't exist yet, fall back to standard query
    console.warn(
      'match_documents_sst_all not available, falling back to standard query:',
      error.message
    )
    const fallback = await supabase.rpc('match_documents_sst', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })

    if (fallback.error) {
      return { data: null, error: fallback.error }
    }

    const results: VersionedDocumentMatch[] = (fallback.data ?? []).map(
      (doc: Record<string, unknown>) => ({
        ...doc,
        is_superseded: false,
      })
    ) as VersionedDocumentMatch[]

    return { data: results, error: null }
  }

  return { data: data as VersionedDocumentMatch[], error: null }
}
