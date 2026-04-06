/**
 * Utilitaire commun pour extraire le texte des PDFs réglementaires suisses
 * et le découper par article/chapitre.
 */

import { readFileSync } from 'fs'
import type { DocumentChunk, ChunkMetadata } from './chunk'
import { chunkDocument } from './chunk'

export interface PdfParserOptions {
  pdfPath: string
  source: string
  versionDate: string
  sourceUrl: string
  language?: string
  splitPattern?: RegExp
}

export async function parsePdf(options: PdfParserOptions): Promise<DocumentChunk[]> {
  const {
    pdfPath,
    source,
    versionDate,
    sourceUrl,
    language = 'fr',
    splitPattern,
  } = options

  console.log(`[${source}] Reading PDF: ${pdfPath}`)
  const buffer = readFileSync(pdfPath)

  // Use unpdf to extract text
  const { extractText } = await import('unpdf')
  const result = await extractText(new Uint8Array(buffer))

  // unpdf returns text as string[] (one per page), join them
  const text = Array.isArray(result.text) ? result.text.join('\n\n') : String(result.text)

  console.log(`[${source}] Extracted ${result.totalPages} pages, ${text.length} chars`)

  // Clean up extracted text
  let cleanText = text
    // Remove page numbers like "1 / 34"
    .replace(/\d+\s*\/\s*\d+/g, '')
    // Remove common header/footer patterns
    .replace(/832\.311\.141/g, '')
    .replace(/832\.30/g, '')
    .replace(/Assurance en cas de maladie et d['']accidents/g, '')
    .replace(/O sur les travaux de construction/g, '')
    .replace(/RO \d{4} \d+/g, '')
    .replace(/RS \d+\.\d+/g, '')
    // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const metadata: Omit<ChunkMetadata, 'article'> = {
    source,
    versionDate,
    sourceUrl,
    language,
  }

  const pattern = splitPattern || /(?=Art\.\s*\d+|Chapitre\s+\d+|Section\s+\d+)/gi
  const chunks = chunkDocument(cleanText, metadata, pattern)

  console.log(`[${source}] Generated ${chunks.length} chunks from real PDF`)
  return chunks
}
