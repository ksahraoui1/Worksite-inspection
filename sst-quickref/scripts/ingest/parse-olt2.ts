/**
 * Parser OLT2 — Ordonnance 2 relative à la loi sur le travail (RS 822.112)
 * Prescriptions spéciales de protection de la santé
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { DocumentChunk } from './chunk'
import { parsePdf } from './parse-pdf'

const PDF_FILE = resolve(process.cwd(), 'data', 'olt2.pdf')

export async function parseOLT2(): Promise<DocumentChunk[]> {
  if (!existsSync(PDF_FILE)) {
    console.log(`[OLT2] PDF not found at ${PDF_FILE} — skipping`)
    return []
  }

  return parsePdf({
    pdfPath: PDF_FILE,
    source: 'OLT2',
    versionDate: '2023-10-15',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/1966/60_57_58/fr',
    language: 'fr',
    splitPattern: /(?=Art\.\s*\d+[a-z]?\b)/gi,
  })
}

if (require.main === module) {
  parseOLT2().then((chunks) => {
    console.log(`\nTotal chunks: ${chunks.length}`)
  })
}
