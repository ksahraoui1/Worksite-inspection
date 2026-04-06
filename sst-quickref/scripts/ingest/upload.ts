/**
 * T011: Upload utility — Insère les chunks avec embeddings dans Supabase
 * Calcule le hash SHA-256 pour traçabilité, skip les doublons
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { DocumentChunk } from './chunk'
import type { EmbeddingResult } from './embed'

export interface UploadResult {
  inserted: number
  skipped: number
  errors: number
}

/**
 * Compute SHA-256 hash of content for integrity tracking.
 */
async function computeSHA256(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Upload document chunks with their embeddings to Supabase.
 * Skips duplicates based on SHA-256 hash + source + article + version_date.
 */
export async function uploadChunks(
  chunks: DocumentChunk[],
  embeddings: EmbeddingResult[],
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<UploadResult> {
  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey)
  const result: UploadResult = { inserted: 0, skipped: 0, errors: 0 }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const embedding = embeddings[i]

    if (!embedding) {
      console.error(`No embedding for chunk ${i}: ${chunk.metadata.article}`)
      result.errors++
      continue
    }

    const sha256Hash = await computeSHA256(chunk.content)

    const { error } = await supabase.from('documents_sst').upsert(
      {
        content: chunk.content,
        embedding: JSON.stringify(embedding.embedding),
        source: chunk.metadata.source,
        article: chunk.metadata.article,
        version_date: chunk.metadata.versionDate,
        source_url: chunk.metadata.sourceUrl,
        is_superseded: false,
        sha256_hash: sha256Hash,
        language: chunk.metadata.language,
      },
      {
        onConflict: 'sha256_hash,source,article,version_date',
        ignoreDuplicates: true,
      }
    )

    if (error) {
      if (error.code === '23505') {
        result.skipped++
      } else {
        console.error(`Upload error for chunk ${i} (${chunk.metadata.article}):`, error.message)
        result.errors++
      }
    } else {
      result.inserted++
    }
  }

  return result
}
