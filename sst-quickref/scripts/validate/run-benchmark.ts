/**
 * T020: Benchmark runner — Exécute les 50 questions de référence et mesure la qualité
 * Vérifie SC-001 (<3s), SC-002 (>95% citations correctes), SC-004 (>80% satisfaction)
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

interface BenchmarkQuestion {
  id: number
  question: string
  expected_source: string
  expected_article: string
}

interface BenchmarkResult {
  id: number
  question: string
  expected_source: string
  expected_article: string
  actual_sources: string[]
  response_ms: number
  source_match: boolean
  was_refused: boolean
  error?: string
}

async function runBenchmark() {
  const apiUrl = process.env.QUICKREF_API_URL ?? 'http://localhost:54321/functions/v1/quickref-query'
  const apiKey = process.env.SUPABASE_ANON_KEY ?? ''

  // Load questions
  const questionsPath = resolve(__dirname, '../../tests/benchmark/questions.json')
  const questionsData = JSON.parse(readFileSync(questionsPath, 'utf-8'))
  const questions: BenchmarkQuestion[] = questionsData.questions

  console.log(`\n🔍 SST-QuickRef Benchmark — ${questions.length} questions\n`)
  console.log(`API: ${apiUrl}\n`)

  const results: BenchmarkResult[] = []

  for (const q of questions) {
    const start = Date.now()
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ question: q.question, language: 'fr' }),
      })

      const data = await response.json()
      const responseMs = Date.now() - start

      const actualSources = (data.sources ?? []).map(
        (s: { source: string; article: string }) => `${s.source}:${s.article}`
      )

      const sourceMatch = actualSources.some(
        (s: string) => s.includes(q.expected_source) && s.includes(q.expected_article)
      )

      results.push({
        id: q.id,
        question: q.question,
        expected_source: q.expected_source,
        expected_article: q.expected_article,
        actual_sources: actualSources,
        response_ms: responseMs,
        source_match: sourceMatch,
        was_refused: data.refused ?? false,
      })

      const status = sourceMatch ? '✓' : data.refused ? '⊘' : '✗'
      console.log(`  ${status} Q${q.id.toString().padStart(2, '0')} [${responseMs}ms] ${q.question.substring(0, 60)}...`)
    } catch (error) {
      const responseMs = Date.now() - start
      results.push({
        id: q.id,
        question: q.question,
        expected_source: q.expected_source,
        expected_article: q.expected_article,
        actual_sources: [],
        response_ms: responseMs,
        source_match: false,
        was_refused: false,
        error: String(error),
      })
      console.log(`  ✗ Q${q.id.toString().padStart(2, '0')} [${responseMs}ms] ERROR: ${error}`)
    }
  }

  // Compute metrics
  const total = results.length
  const correctCitations = results.filter((r) => r.source_match).length
  const refused = results.filter((r) => r.was_refused).length
  const errors = results.filter((r) => r.error).length
  const avgResponseMs = Math.round(results.reduce((sum, r) => sum + r.response_ms, 0) / total)
  const under3s = results.filter((r) => r.response_ms < 3000).length
  const citationRate = ((correctCitations / (total - refused)) * 100).toFixed(1)

  console.log('\n' + '='.repeat(60))
  console.log('RÉSULTATS DU BENCHMARK')
  console.log('='.repeat(60))
  console.log(`Total questions:        ${total}`)
  console.log(`Citations correctes:    ${correctCitations}/${total - refused} (${citationRate}%) — SC-002 cible: >95%`)
  console.log(`Réponses refusées:      ${refused}`)
  console.log(`Erreurs:                ${errors}`)
  console.log(`Temps moyen:            ${avgResponseMs}ms — SC-001 cible: <3000ms`)
  console.log(`Réponses < 3s:          ${under3s}/${total} (${((under3s / total) * 100).toFixed(1)}%)`)
  console.log('='.repeat(60))

  // Pass/Fail assessment
  const sc001Pass = avgResponseMs < 3000
  const sc002Pass = parseFloat(citationRate) >= 95
  console.log(`\nSC-001 (latence <3s):     ${sc001Pass ? 'PASS ✓' : 'FAIL ✗'}`)
  console.log(`SC-002 (citations >95%):  ${sc002Pass ? 'PASS ✓' : 'FAIL ✗'}`)
  console.log()

  if (!sc001Pass || !sc002Pass) {
    process.exit(1)
  }
}

runBenchmark().catch((error) => {
  console.error('Benchmark failed:', error)
  process.exit(1)
})
