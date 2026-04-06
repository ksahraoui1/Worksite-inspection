<script setup lang="ts">
/**
 * T041: Boutons de feedback thumbs up/down
 */
import { ref } from 'vue'
import { sendFeedback } from '@/services/quickref-api'

const props = defineProps<{
  queryId: string
}>()

const submitted = ref(false)
const submittedRating = ref<'up' | 'down' | null>(null)
const submitting = ref(false)

async function handleFeedback(rating: 'up' | 'down') {
  if (submitted.value || submitting.value) return

  submitting.value = true
  try {
    await sendFeedback({ query_id: props.queryId, rating })
    submitted.value = true
    submittedRating.value = rating
  } catch {
    // Silently fail — feedback is non-critical
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-2 mt-1">
    <template v-if="submitted">
      <span class="text-xs text-gray-500">Merci pour votre retour</span>
      <span v-if="submittedRating === 'up'" class="text-teal-600 text-sm">&#x1F44D;</span>
      <span v-else class="text-red-500 text-sm">&#x1F44E;</span>
    </template>
    <template v-else>
      <button
        type="button"
        :disabled="submitting"
        class="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Utile"
        @click="handleFeedback('up')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
        </svg>
      </button>
      <button
        type="button"
        :disabled="submitting"
        class="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Pas utile"
        @click="handleFeedback('down')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" />
        </svg>
      </button>
    </template>
  </div>
</template>
