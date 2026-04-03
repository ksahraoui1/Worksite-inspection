/**
 * Parser OLT3 — Ordonnance 3 relative à la loi sur le travail (RS 822.113)
 * Protection de la santé (éclairage, aération, bruit, ergonomie)
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { DocumentChunk } from './chunk'
import { parsePdf } from './parse-pdf'

const PDF_FILE = resolve(process.cwd(), 'data', 'olt3.pdf')

export async function parseOLT3(): Promise<DocumentChunk[]> {
  if (!existsSync(PDF_FILE)) {
    console.log(`[OLT3] PDF not found at ${PDF_FILE} — skipping`)
    return []
  }

  return parsePdf({
    pdfPath: PDF_FILE,
    source: 'OLT3',
    versionDate: '2015-10-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/1993/2553_2553_2553/fr',
    language: 'fr',
    splitPattern: /(?=Art\.\s*\d+[a-z]?\b)/gi,
  })
}

if (require.main === module) {
  parseOLT3().then((chunks) => {
    console.log(`\nTotal chunks: ${chunks.length}`)
  })
}
