<script setup lang="ts">
/**
 * T034+T039: Page de chat plein écran
 * Gauche: ChatWindow. Droite: SourceCards. Bas: Disclaimer.
 * Cache offline, bannière hors-ligne, désactivation input offline.
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import ChatWindow from '@/components/ChatWindow.vue'
import SourceCard from '@/components/SourceCard.vue'
import DisclaimerBanner from '@/components/DisclaimerBanner.vue'
import { useChat } from '@/composables/useChat'
import { useOnlineStatus } from '@/composables/useOnlineStatus'
import { useOfflineCache } from '@/composables/useOfflineCache'
import { getAdminKey, setAdminKey, clearAdminKey } from '@/services/quickref-api'
import type { QuickRefSource } from '@/types'

const router = useRouter()
const { messages, loading, error, rateLimit, sendMessage, clearChat } = useChat()
const { isOnline } = useOnlineStatus()
const { saveToCache, loadFromCache, clearCache } = useOfflineCache()

// Load cached messages on mount
onMounted(async () => {
  const cached = await loadFromCache()
  if (cached.length > 0) {
    messages.value = cached
  }
})

// Save to cache on new messages
watch(
  () => messages.value.length,
  async () => {
    if (messages.value.length > 0) {
      await saveToCache(messages.value)
    }
  }
)

// Sources for the latest assistant message
const currentSources = computed<QuickRefSource[]>(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    const msg = messages.value[i]
    if (msg.role === 'assistant' && msg.sources && msg.sources.length > 0) {
      return msg.sources
    }
  }
  return []
})

function handleSend(question: string) {
  sendMessage(question)
}

async function handleClear() {
  clearChat()
  await clearCache()
}

function goHome() {
  router.push('/')
}

// Admin key management
const showAdminModal = ref(false)
const adminKeyInput = ref('')
const isAdmin = ref(!!getAdminKey())

function openAdminModal() {
  adminKeyInput.value = getAdminKey() || ''
  showAdminModal.value = true
}

function saveAdminKey() {
  if (adminKeyInput.value.trim()) {
    setAdminKey(adminKeyInput.value.trim())
    isAdmin.value = true
  } else {
    clearAdminKey()
    isAdmin.value = false
  }
  showAdminModal.value = false
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- Header bar -->
    <header class="bg-gray-900 text-white shrink-0">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            title="Retour à l'accueil"
            @click="goHome"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div class="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <span class="text-lg font-bold tracking-tight">SST-QuickRef</span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Rate limit info -->
          <span
            v-if="rateLimit.remaining.value !== null && !rateLimit.isLimited.value"
            class="text-xs text-gray-400"
          >
            {{ rateLimit.remaining.value }} requêtes restantes
          </span>

          <!-- Admin badge -->
          <span
            v-if="isAdmin"
            class="text-xs bg-teal-600 text-white px-2 py-1 rounded-full font-medium"
          >
            Pro
          </span>

          <!-- Admin key -->
          <button
            type="button"
            class="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            title="Clé admin"
            @click="openAdminModal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </button>

          <!-- Clear chat -->
          <button
            type="button"
            class="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            title="Effacer la conversation"
            @click="handleClear"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Offline banner -->
    <div
      v-if="!isOnline"
      class="bg-amber-500 text-white text-center text-sm py-2 font-medium shrink-0"
    >
      Vous êtes hors-ligne. Les réponses précédentes restent disponibles.
    </div>

    <!-- Rate limit banner -->
    <div
      v-if="rateLimit.isLimited.value"
      class="bg-amber-100 text-amber-800 text-center text-sm py-3 px-4 font-medium shrink-0"
    >
      {{ rateLimit.upgradeMessage.value }}
      <button
        type="button"
        class="ml-3 underline font-semibold hover:text-amber-900"
      >
        Voir le Plan Pro
      </button>
    </div>

    <!-- Error banner -->
    <div
      v-if="error"
      class="bg-red-100 text-red-800 text-center text-sm py-2 px-4 shrink-0"
    >
      {{ error }}
    </div>

    <!-- Main content -->
    <div class="flex-1 flex overflow-hidden min-h-0">
      <!-- Chat panel -->
      <div class="flex-1 flex flex-col min-w-0">
        <ChatWindow
          :messages="messages"
          :loading="loading"
          :disabled="!isOnline"
          @send="handleSend"
        />
      </div>

      <!-- Sources sidebar (hidden on mobile, shown on lg+) -->
      <aside
        v-if="currentSources.length > 0"
        class="hidden lg:flex lg:flex-col lg:w-96 border-l border-gray-200 bg-white overflow-y-auto p-4"
      >
        <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Sources citées
        </h2>
        <div class="space-y-3">
          <SourceCard
            v-for="(source, index) in currentSources"
            :key="index"
            :source="source"
          />
        </div>
      </aside>
    </div>

    <!-- Mobile sources (collapsible, shown below chat on small screens) -->
    <details
      v-if="currentSources.length > 0"
      class="lg:hidden border-t border-gray-200 bg-white shrink-0"
    >
      <summary class="min-h-[44px] flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-50">
        <span>Sources citées ({{ currentSources.length }})</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div class="px-4 pb-4 space-y-3 max-h-64 overflow-y-auto">
        <SourceCard
          v-for="(source, index) in currentSources"
          :key="index"
          :source="source"
        />
      </div>
    </details>

    <!-- Disclaimer -->
    <DisclaimerBanner />

    <!-- Admin key modal -->
    <div
      v-if="showAdminModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showAdminModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Clé d'accès Pro</h3>
        <p class="text-sm text-gray-500 mb-4">Entrez votre clé pour un accès illimité.</p>
        <input
          v-model="adminKeyInput"
          type="password"
          placeholder="sqr-admin-..."
          class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
        />
        <div class="flex gap-3 justify-end">
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            @click="showAdminModal = false"
          >
            Annuler
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-sm bg-teal-600 text-white font-medium hover:bg-teal-700"
            @click="saveAdminKey"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
