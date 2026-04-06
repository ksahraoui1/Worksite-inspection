/**
 * Parser générique — Parse n'importe quel document du registre via parse-pdf.ts
 * Gère les 3 cas : PDF, inline content (articles de code), fichier texte
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parsePdf } from './parse-pdf'
import { chunkDocument, type DocumentChunk } from './chunk'
import type { DocumentEntry } from './documents-registry'

/**
 * Parse un document du registre en chunks.
 * - Si inlineContent est défini : utilise le texte inline (CO art. 328, CP art. 229)
 * - Si le PDF existe dans data/ : utilise parse-pdf
 * - Si un .txt existe dans data/ : utilise le texte brut
 * - Sinon : lance une erreur
 */
export async function parseDocument(doc: DocumentEntry): Promise<DocumentChunk[]> {
  const metadata = {
    source: doc.source,
    versionDate: doc.versionDate,
    sourceUrl: doc.sourceUrl,
    language: 'fr',
  }

  // Cas 1 : contenu inline (articles de code isolés)
  if (doc.inlineContent) {
    console.log(`[${doc.source}] Using inline content`)
    const chunks = chunkDocument(
      doc.inlineContent,
      metadata,
      /(?=Art\.\s*\d+[a-z]?\s+(CO|CP)\b)/gi
    )
    // Si le pattern ne split pas, on crée un chunk unique
    if (chunks.length === 0) {
      chunks.push({
        content: doc.inlineContent,
        metadata: { ...metadata, article: doc.reference },
      })
    }
    console.log(`[${doc.source}] ${chunks.length} chunks from inline content`)
    return chunks
  }

  // Cas 2 : fichier PDF
  const pdfPath = resolve(process.cwd(), 'data', doc.filename)
  if (existsSync(pdfPath)) {
    const defaultPattern = /(?=Art\.\s*\d+[a-z]?\b)/gi
    return parsePdf({
      pdfPath,
      source: doc.source,
      versionDate: doc.versionDate,
      sourceUrl: doc.sourceUrl,
      language: 'fr',
      splitPattern: doc.splitPattern || defaultPattern,
    })
  }

  // Cas 3 : fichier texte
  const txtFilename = doc.filename.replace('.pdf', '.txt')
  const txtPath = resolve(process.cwd(), 'data', txtFilename)
  if (existsSync(txtPath)) {
    console.log(`[${doc.source}] Reading from text file: ${txtPath}`)
    const rawText = readFileSync(txtPath, 'utf-8')
    const defaultPattern = /(?=Art\.\s*\d+[a-z]?\b)/gi
    const chunks = chunkDocument(rawText, metadata, doc.splitPattern || defaultPattern)
    console.log(`[${doc.source}] ${chunks.length} chunks from text file`)
    return chunks
  }

  throw new Error(
    `[${doc.source}] Aucun fichier trouvé : ${pdfPath}\n` +
    `  Téléchargez-le avec : npx tsx scripts/ingest/download-all.ts`
  )
}
