<script setup lang="ts">
/**
 * T027+T044: Carte de source réglementaire
 * Citation: [Source] Art. XX — Version JJ.MM.AAAA
 * Badge ambre si texte > 6 mois
 */
import { ref, computed } from 'vue'
import type { QuickRefSource } from '@/types'

const props = defineProps<{
  source: QuickRefSource
}>()

const expanded = ref(false)

const formattedDate = computed(() => {
  const d = new Date(props.source.version_date)
  return d.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
})

const isStale = computed(() => {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  return new Date(props.source.version_date) < sixMonthsAgo
})

const citation = computed(() => {
  return `[${props.source.source}] Art. ${props.source.article} — Version ${formattedDate.value}`
})

const excerptPreview = computed(() => {
  if (props.source.excerpt.length <= 150) return props.source.excerpt
  return props.source.excerpt.slice(0, 150) + '...'
})
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-semibold text-gray-900 truncate">
          {{ source.source }}
        </h4>
        <p class="text-xs text-gray-600 mt-0.5">
          Art. {{ source.article }}
        </p>
      </div>
      <span
        :class="[
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
          isStale
            ? 'bg-amber-100 text-amber-800 border border-amber-300'
            : 'bg-teal-100 text-teal-800 border border-teal-300',
        ]"
      >
        Texte à jour au {{ formattedDate }}
      </span>
    </div>

    <!-- Citation -->
    <p class="mt-2 text-xs text-gray-500 font-mono">
      {{ citation }}
    </p>

    <!-- Excerpt -->
    <div class="mt-3">
      <p class="text-sm text-gray-700 leading-relaxed">
        {{ expanded ? source.excerpt : excerptPreview }}
      </p>
      <button
        v-if="source.excerpt.length > 150"
        type="button"
        class="mt-1 min-h-[44px] text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Réduire' : 'Voir plus' }}
      </button>
    </div>

    <!-- Link -->
    <a
      v-if="source.source_url"
      :href="source.source_url"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-3 inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      Consulter le texte officiel
    </a>
  </div>
</template>
