/**
 * T032: Suivi du rate limiting depuis les headers API
 */

import { ref, computed } from 'vue'
import { getRateLimitRemaining } from '@/services/quickref-api'

export function useRateLimit() {
  const remaining = ref<number | null>(null)
  const resetTime = ref<Date | null>(null)
  const isLimited = computed(() => remaining.value !== null && remaining.value <= 0)

  function updateFromHeaders() {
    const value = getRateLimitRemaining()
    if (value !== null) {
      remaining.value = value
    }
  }

  function setLimited(retryAfterSeconds: number) {
    remaining.value = 0
    resetTime.value = new Date(Date.now() + retryAfterSeconds * 1000)

    setTimeout(() => {
      remaining.value = null
      resetTime.value = null
    }, retryAfterSeconds * 1000)
  }

  const upgradeMessage = computed(() => {
    if (!isLimited.value) return null
    return 'Limite de requêtes atteinte. Passez au Plan Pro pour un accès illimité.'
  })

  return {
    remaining,
    isLimited,
    resetTime,
    upgradeMessage,
    updateFromHeaders,
    setLimited,
  }
}
