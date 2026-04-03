/**
 * T010: Embedding utility — Appel API OpenAI text-embedding-3-small
 * Retourne des vecteurs de dimension 1536
 */

const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small'
const BATCH_SIZE = 5
const RETRY_DELAY_MS = 5000
const MAX_RETRIES = 5

export interface EmbeddingResult {
  text: string
  embedding: number[]
}

/**
 * Generate embeddings for a batch of texts using OpenAI API.
 * Handles rate limiting with exponential backoff.
 */
export async function generateEmbeddings(
  texts: string[],
  apiKey: string
): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const embeddings = await callEmbeddingAPI(batch, apiKey)

    for (let j = 0; j < batch.length; j++) {
      results.push({
        text: batch[j],
        embedding: embeddings[j],
      })
    }

    // Delay between batches to avoid rate limiting (especially on free tier)
    if (i + BATCH_SIZE < texts.length) {
      console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)} done, waiting...`)
      await sleep(2000)
    }
  }

  return results
}

/**
 * Generate embedding for a single text.
 */
export async function generateSingleEmbedding(
  text: string,
  apiKey: string
): Promise<number[]> {
  const results = await callEmbeddingAPI([text], apiKey)
  return results[0]
}

async function callEmbeddingAPI(
  texts: string[],
  apiKey: string,
  attempt = 0
): Promise<number[][]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_EMBEDDING_MODEL,
        input: texts,
      }),
    })

    if (response.status === 429 && attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt)
      console.warn(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`)
      await sleep(delay)
      return callEmbeddingAPI(texts, apiKey, attempt + 1)
    }

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data
      .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
      .map((item: { embedding: number[] }) => item.embedding)
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt)
      console.warn(`API call failed, retrying in ${delay}ms: ${error}`)
      await sleep(delay)
      return callEmbeddingAPI(texts, apiKey, attempt + 1)
    }
    throw error
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
