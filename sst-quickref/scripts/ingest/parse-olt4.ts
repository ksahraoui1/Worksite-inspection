/**
 * Parser OLT4 — Ordonnance 4 relative à la loi sur le travail (RS 822.114)
 * Entreprises industrielles, approbation des plans, autorisation d'exploiter
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { DocumentChunk } from './chunk'
import { parsePdf } from './parse-pdf'

const PDF_FILE = resolve(process.cwd(), 'data', 'olt4.pdf')

export async function parseOLT4(): Promise<DocumentChunk[]> {
  if (!existsSync(PDF_FILE)) {
    console.log(`[OLT4] PDF not found at ${PDF_FILE} — skipping`)
    return []
  }

  return parsePdf({
    pdfPath: PDF_FILE,
    source: 'OLT4',
    versionDate: '2002-06-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/1966/63_57_58/fr',
    language: 'fr',
    splitPattern: /(?=Art\.\s*\d+[a-z]?\b)/gi,
  })
}

if (require.main === module) {
  parseOLT4().then((chunks) => {
    console.log(`\nTotal chunks: ${chunks.length}`)
  })
}
