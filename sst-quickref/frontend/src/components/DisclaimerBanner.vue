<script setup lang="ts">
/**
 * T028: Bannière de non-responsabilité
 */
import { ref } from 'vue'

const collapsed = ref(true)

const disclaimerText =
  'SST-QuickRef est un outil d\'aide à la recherche réglementaire. Les réponses fournies sont générées par intelligence artificielle à partir de textes officiels et ne constituent pas un avis juridique. Vérifiez toujours les informations auprès des sources officielles avant toute application. Securionis Sàrl décline toute responsabilité en cas d\'erreur ou d\'omission.'
</script>

<template>
  <div class="fixed bottom-0 inset-x-0 z-40 bg-gray-100 border-t border-gray-300">
    <div class="max-w-5xl mx-auto px-4 py-2">
      <div class="flex items-center justify-between gap-3">
        <p v-if="collapsed" class="text-xs text-gray-500 truncate">
          Les réponses ne constituent pas un avis juridique. Vérifiez les sources.
        </p>
        <p v-else class="text-xs text-gray-500 leading-relaxed">
          {{ disclaimerText }}
        </p>
        <button
          type="button"
          class="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          :title="collapsed ? 'Voir le avertissement complet' : 'Réduire'"
          @click="collapsed = !collapsed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 transition-transform"
            :class="{ 'rotate-180': !collapsed }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
