/**
 * T016: Orchestrator — Runs all parsers, generates embeddings, uploads to Supabase
 * Usage: npx tsx scripts/ingest/run-all.ts
 *
 * Required environment variables (in .env or shell):
 *   OPENAI_API_KEY        — OpenAI API key for embeddings
 *   SUPABASE_URL          — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY  — Supabase service role key (not anon key)
 */

import { parseOTConst } from './parse-otconst'
import { parseCFST6508 } from './parse-cfst6508'
import { parseOPA } from './parse-opa'
import { parseOLT1 } from './parse-olt1'
import { parseOLT2 } from './parse-olt2'
import { parseOLT3 } from './parse-olt3'
import { parseOLT4 } from './parse-olt4'
import { generateEmbeddings } from './embed'
import { uploadChunks } from './upload'
import type { DocumentChunk } from './chunk'

/** Load .env file if present (no external dependency) */
function loadEnvFile(): void {
  try {
    const { readFileSync, existsSync } = require('node:fs')
    const { resolve } = require('node:path')
    const envPath = resolve(process.cwd(), '.env')

    if (!existsSync(envPath)) {
      console.log('[env] No .env file found, using shell environment')
      return
    }

    const content = readFileSync(envPath, 'utf-8') as string
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue

      const key = trimmed.slice(0, eqIndex).trim()
      let value = trimmed.slice(eqIndex + 1).trim()

      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }

      if (!process.env[key]) {
        process.env[key] = value
      }
    }

    console.log('[env] Loaded .env file')
  } catch {
    // Silently continue without .env
  }
}

interface ParserResult {
  name: string
  chunks: DocumentChunk[]
}

interface PipelineStats {
  sources: { name: string; chunkCount: number }[]
  totalChunks: number
  embeddingsGenerated: number
  uploaded: { inserted: number; skipped: number; errors: number }
  durationMs: number
}

async function runPipeline(): Promise<PipelineStats> {
  const start = Date.now()
  const stats: PipelineStats = {
    sources: [],
    totalChunks: 0,
    embeddingsGenerated: 0,
    uploaded: { inserted: 0, skipped: 0, errors: 0 },
    durationMs: 0,
  }

  // --- Step 1: Parse all sources ---
  console.log('\n========== Step 1: Parsing documents ==========\n')

  const parsers: { name: string; fn: () => Promise<DocumentChunk[]> }[] = [
    { name: 'OTConst', fn: parseOTConst },
    { name: 'CFST_6508', fn: parseCFST6508 },
    { name: 'OPA', fn: parseOPA },
    { name: 'OLT1', fn: parseOLT1 },
    { name: 'OLT2', fn: parseOLT2 },
    { name: 'OLT3', fn: parseOLT3 },
    { name: 'OLT4', fn: parseOLT4 },
  ]

  const allChunks: DocumentChunk[] = []

  for (const parser of parsers) {
    try {
      console.log(`--- Parsing ${parser.name} ---`)
      const chunks = await parser.fn()
      allChunks.push(...chunks)
      stats.sources.push({ name: parser.name, chunkCount: chunks.length })
      console.log(`[${parser.name}] ${chunks.length} chunks\n`)
    } catch (error) {
      console.error(`[${parser.name}] Parser failed:`, error)
      stats.sources.push({ name: parser.name, chunkCount: 0 })
    }
  }

  stats.totalChunks = allChunks.length
  console.log(`Total chunks from all sources: ${stats.totalChunks}`)

  if (stats.totalChunks === 0) {
    console.error('No chunks produced. Aborting.')
    stats.durationMs = Date.now() - start
    return stats
  }

  // --- Step 2: Generate embeddings ---
  console.log('\n========== Step 2: Generating embeddings ==========\n')

  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    console.error('OPENAI_API_KEY not set. Skipping embeddings and upload.')
    console.log('To run the full pipeline, set OPENAI_API_KEY in .env or shell.')
    stats.durationMs = Date.now() - start
    return stats
  }

  const texts = allChunks.map((c) => c.content)
  console.log(`Generating embeddings for ${texts.length} chunks...`)

  const embeddings = await generateEmbeddings(texts, openaiKey)
  stats.embeddingsGenerated = embeddings.length
  console.log(`Generated ${embeddings.length} embeddings`)

  // --- Step 3: Upload to Supabase ---
  console.log('\n========== Step 3: Uploading to Supabase ==========\n')

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Skipping upload.')
    console.log('To run the full pipeline, set both in .env or shell.')
    stats.durationMs = Date.now() - start
    return stats
  }

  console.log(`Uploading ${allChunks.length} chunks to Supabase...`)
  const uploadResult = await uploadChunks(allChunks, embeddings, supabaseUrl, supabaseServiceKey)
  stats.uploaded = uploadResult
  console.log(`Upload complete: ${uploadResult.inserted} inserted, ${uploadResult.skipped} skipped, ${uploadResult.errors} errors`)

  stats.durationMs = Date.now() - start
  return stats
}

function printSummary(stats: PipelineStats): void {
  console.log('\n========== Pipeline Summary ==========\n')
  console.log('Sources:')
  for (const src of stats.sources) {
    console.log(`  ${src.name}: ${src.chunkCount} chunks`)
  }
  console.log(`\nTotal chunks:        ${stats.totalChunks}`)
  console.log(`Embeddings generated: ${stats.embeddingsGenerated}`)
  console.log(`Uploaded — inserted:  ${stats.uploaded.inserted}`)
  console.log(`Uploaded — skipped:   ${stats.uploaded.skipped}`)
  console.log(`Uploaded — errors:    ${stats.uploaded.errors}`)
  console.log(`Duration:             ${(stats.durationMs / 1000).toFixed(1)}s`)
  console.log()
}

async function main() {
  console.log('=== SST Document Ingestion Pipeline (T016) ===')
  console.log(`Started at ${new Date().toISOString()}\n`)

  loadEnvFile()

  try {
    const stats = await runPipeline()
    printSummary(stats)

    if (stats.uploaded.errors > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error('\nPipeline failed with fatal error:', error)
    process.exit(1)
  }
}

main()
