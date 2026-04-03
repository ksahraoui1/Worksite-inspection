/**
 * T030: Composable de gestion du chat
 */

import { ref } from 'vue'
import type { ChatMessage } from '@/types'
import { sendQuestion, RateLimitError } from '@/services/quickref-api'
import { useRateLimit } from './useRateLimit'

function generateId(): string {
  return crypto.randomUUID()
}

export function useChat() {
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const rateLimit = useRateLimit()

  async function sendMessage(question: string) {
    if (!question.trim() || loading.value) return

    error.value = null

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
    }
    messages.value.push(userMessage)

    loading.value = true

    try {
      const response = await sendQuestion({
        question: question.trim(),
        language: 'fr',
      })

      rateLimit.updateFromHeaders()

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.answer ?? '',
        sources: response.sources,
        query_id: response.query_id,
        refused: response.refused,
        refused_reason: response.refused_reason,
        timestamp: new Date(),
      }
      messages.value.push(assistantMessage)
    } catch (err) {
      if (err instanceof RateLimitError) {
        rateLimit.setLimited(err.retryAfter)
        error.value = rateLimit.upgradeMessage.value
      } else if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Une erreur inattendue est survenue.'
      }

      // Add error message as assistant
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: error.value ?? 'Erreur inconnue.',
        refused: true,
        refused_reason: error.value ?? undefined,
        timestamp: new Date(),
      }
      messages.value.push(errorMessage)
    } finally {
      loading.value = false
    }
  }

  function clearChat() {
    messages.value = []
    error.value = null
  }

  return {
    messages,
    loading,
    error,
    rateLimit,
    sendMessage,
    clearChat,
  }
}
