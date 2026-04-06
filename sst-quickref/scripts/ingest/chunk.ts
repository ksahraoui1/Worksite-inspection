/**
 * T009: Chunking utility — Découpe les textes réglementaires en fragments sémantiques
 * Max 512 tokens par chunk, découpage par article/alinéa/bloc thématique
 */

export interface ChunkMetadata {
  source: string
  article: string
  versionDate: string
  sourceUrl: string
  language: string
}

export interface DocumentChunk {
  content: string
  metadata: ChunkMetadata
}

const MAX_CHUNK_TOKENS = 512
const AVG_CHARS_PER_TOKEN = 4

/**
 * Estimate token count from character length (conservative approximation)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / AVG_CHARS_PER_TOKEN)
}

/**
 * Split a raw document text into semantic chunks by article/alinéa.
 * Preserves metadata for each chunk.
 */
export function chunkDocument(
  fullText: string,
  metadata: Omit<ChunkMetadata, 'article'>,
  articlePattern: RegExp = /(?=Art\.\s*\d+|Chapitre\s+\d+|Section\s+\d+|§\s*\d+)/gi
): DocumentChunk[] {
  const chunks: DocumentChunk[] = []

  // Split by article boundaries
  const sections = fullText.split(articlePattern).filter((s) => s.trim().length > 0)

  for (const section of sections) {
    const trimmed = section.trim()
    if (!trimmed) continue

    // Extract article reference from the section start
    const articleMatch = trimmed.match(/^(Art\.\s*\d+[a-z]?|Chapitre\s+\d+|Section\s+\d+|§\s*\d+)/i)
    const article = articleMatch ? articleMatch[1] : 'N/A'

    if (estimateTokens(trimmed) <= MAX_CHUNK_TOKENS) {
      chunks.push({
        content: trimmed,
        metadata: { ...metadata, article },
      })
    } else {
      // Split oversized sections by paragraph
      const paragraphs = trimmed.split(/\n\n+/)
      let currentChunk = ''

      for (const paragraph of paragraphs) {
        const combined = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph

        if (estimateTokens(combined) <= MAX_CHUNK_TOKENS) {
          currentChunk = combined
        } else {
          if (currentChunk) {
            chunks.push({
              content: currentChunk,
              metadata: { ...metadata, article },
            })
          }
          currentChunk = paragraph
        }
      }

      if (currentChunk) {
        chunks.push({
          content: currentChunk,
          metadata: { ...metadata, article },
        })
      }
    }
  }

  return chunks
}
