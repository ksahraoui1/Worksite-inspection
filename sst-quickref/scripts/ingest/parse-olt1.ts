/**
 * Parser OLT1 — Ordonnance 1 relative à la loi sur le travail (RS 822.111)
 * Durée du travail, repos, horaires, travail de nuit/dimanche
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { DocumentChunk } from './chunk'
import { parsePdf } from './parse-pdf'

const PDF_FILE = resolve(process.cwd(), 'data', 'olt1.pdf')

export async function parseOLT1(): Promise<DocumentChunk[]> {
  if (!existsSync(PDF_FILE)) {
    console.log(`[OLT1] PDF not found at ${PDF_FILE} — skipping`)
    return []
  }

  return parsePdf({
    pdfPath: PDF_FILE,
    source: 'OLT1',
    versionDate: '2021-11-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/1966/57_57_57/fr',
    language: 'fr',
    splitPattern: /(?=Art\.\s*\d+[a-z]?\b)/gi,
  })
}

if (require.main === module) {
  parseOLT1().then((chunks) => {
    console.log(`\nTotal chunks: ${chunks.length}`)
  })
}
