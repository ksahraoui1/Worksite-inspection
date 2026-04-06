/**
 * Télécharge tous les PDFs réglementaires depuis fedlex.admin.ch via SPARQL API
 * Usage: npx tsx scripts/ingest/download-all.ts
 *
 * Utilise le SPARQL endpoint de fedlex pour trouver les URLs PDF exactes,
 * puis télécharge la version française la plus récente de chaque texte.
 */

import { existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { NEW_DOCUMENTS, type DocumentEntry } from './documents-registry'

const DATA_DIR = resolve(process.cwd(), 'data')
const SPARQL_ENDPOINT = 'https://fedlex.data.admin.ch/sparqlendpoint'
const FILESTORE_PUBLIC = 'https://fedlex.data.admin.ch/filestore'
const FILESTORE_INTRANET = 'https://intranet.fedlex.admin.ch/casematesbo/filestore'

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Trouve l'URL PDF la plus récente via SPARQL pour un identifiant ELI donné
 */
async function findPdfUrlViaSparql(eliId: string): Promise<string | null> {
  const query = `SELECT ?s ?o WHERE {
  ?s <http://data.legilux.public.lu/resource/ontology/jolux#isExemplifiedByPrivate> ?o .
  FILTER(CONTAINS(STR(?s), "${eliId}") && CONTAINS(STR(?s), "/fr/pdf-a"))
} ORDER BY DESC(?s) LIMIT 1`

  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}`

  try {
    const resp = await fetch(url, {
      headers: { 'Accept': 'application/sparql-results+json' },
    })

    if (!resp.ok) return null

    const data = await resp.json()
    const bindings = data?.results?.bindings
    if (!bindings || bindings.length === 0) return null

    // Convert intranet URL to public filestore URL
    const intranetUrl = bindings[0].o.value as string
    return intranetUrl.replace(FILESTORE_INTRANET, FILESTORE_PUBLIC)
  } catch {
    return null
  }
}

/**
 * Extrait l'identifiant ELI depuis l'URL source du registre
 * Ex: https://www.fedlex.admin.ch/eli/cc/1982/1676_1676_1676/fr → 1982/1676_1676_1676
 */
function extractEliId(sourceUrl: string): string | null {
  const match = sourceUrl.match(/eli\/cc\/(.+?)\/fr/)
  return match ? match[1] : null
}

async function downloadPdf(doc: DocumentEntry): Promise<boolean> {
  if (!doc.filename) {
    console.log(`[${doc.source}] ⏭  Contenu inline (pas de PDF)`)
    return true
  }

  const filePath = resolve(DATA_DIR, doc.filename)
  if (existsSync(filePath)) {
    console.log(`[${doc.source}] ✓ Déjà présent: ${doc.filename}`)
    return true
  }

  // Pour les lois et ordonnances: utiliser SPARQL + fedlex filestore
  if (doc.type === 'loi' || doc.type === 'ordonnance') {
    const eliId = extractEliId(doc.sourceUrl)
    if (eliId) {
      console.log(`[${doc.source}] 🔍 Recherche SPARQL (ELI: ${eliId})...`)
      const pdfUrl = await findPdfUrlViaSparql(eliId)

      if (pdfUrl) {
        console.log(`[${doc.source}] ⬇ ${pdfUrl.split('/').pop()}`)
        try {
          const resp = await fetch(pdfUrl, { redirect: 'follow' })
          if (resp.ok) {
            const buffer = Buffer.from(await resp.arrayBuffer())
            if (buffer.length > 100 && buffer.subarray(0, 5).toString('utf-8') === '%PDF-') {
              writeFileSync(filePath, buffer)
              console.log(`[${doc.source}] ✓ Téléchargé: ${doc.filename} (${(buffer.length / 1024).toFixed(0)} Ko)`)
              return true
            }
          }
        } catch (e) {
          console.error(`[${doc.source}] ✗ Erreur téléchargement: ${e}`)
        }
      }
    }

    printManualInstructions(doc)
    return false
  }

  // Pour les directives CFST/ESTI: téléchargement direct
  if (doc.downloadUrl) {
    console.log(`[${doc.source}] ⬇ ${doc.downloadUrl}`)
    try {
      const resp = await fetch(doc.downloadUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SST-QuickRef/1.0)' },
        redirect: 'follow',
      })

      if (resp.ok) {
        const buffer = Buffer.from(await resp.arrayBuffer())
        if (buffer.length > 100) {
          writeFileSync(filePath, buffer)
          console.log(`[${doc.source}] ✓ Téléchargé: ${doc.filename} (${(buffer.length / 1024).toFixed(0)} Ko)`)
          return true
        }
      }
    } catch {
      // fall through
    }

    printManualInstructions(doc)
    return false
  }

  printManualInstructions(doc)
  return false
}

function printManualInstructions(doc: DocumentEntry): void {
  console.error(`[${doc.source}] ✗ Téléchargement auto échoué. Téléchargez manuellement:`)
  if (doc.type === 'directive') {
    console.error(`  → Cherchez "${doc.reference}" sur https://www.ekas.admin.ch/ ou https://www.suva.ch/`)
  } else {
    const rs = doc.reference.replace('RS ', '')
    console.error(`  → https://www.fedlex.admin.ch/fr/cc?rs=${rs}`)
  }
  console.error(`  → Enregistrez sous: data/${doc.filename}`)
}

async function main() {
  console.log('=== Téléchargement des PDFs réglementaires SST ===\n')

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }

  const docsToDownload = NEW_DOCUMENTS.filter((d) => d.filename)
  const inlineDocs = NEW_DOCUMENTS.filter((d) => d.inlineContent)

  console.log(`${docsToDownload.length} PDFs à télécharger, ${inlineDocs.length} documents inline\n`)

  let success = 0
  let failed = 0
  const failedDocs: DocumentEntry[] = []

  for (const doc of docsToDownload) {
    const ok = await downloadPdf(doc)
    if (ok) success++
    else {
      failed++
      failedDocs.push(doc)
    }
    await sleep(1500) // Politesse envers les serveurs
  }

  console.log(`\n========== Résumé ==========`)
  console.log(`✓ Téléchargés: ${success}/${docsToDownload.length}`)
  console.log(`✗ Échoués:     ${failed}/${docsToDownload.length}`)
  console.log(`⏭ Inline:      ${inlineDocs.length} (CO art. 328, CP art. 229)`)

  if (failedDocs.length > 0) {
    console.log(`\n=== PDFs à télécharger manuellement ===\n`)
    for (const doc of failedDocs) {
      console.log(`${doc.source} (${doc.reference}): ${doc.name}`)
      if (doc.type === 'directive') {
        console.log(`  → Cherchez sur https://www.ekas.admin.ch/ ou https://www.suva.ch/`)
      } else {
        const rs = doc.reference.replace('RS ', '')
        console.log(`  → https://www.fedlex.admin.ch/fr/cc?rs=${rs}`)
      }
      console.log(`  → data/${doc.filename}\n`)
    }
  }

  if (failed === 0) {
    console.log(`\n✓ Tous les PDFs sont prêts ! Lancez l'ingestion:`)
    console.log(`  npx tsx scripts/ingest/run-all.ts`)
  }
}

main().catch(console.error)
