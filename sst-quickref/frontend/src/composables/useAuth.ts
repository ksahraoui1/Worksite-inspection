/**
 * Composable d'authentification — Magic link via Supabase Auth
 * Avec contrôle de session unique (1 seul appareil simultané)
 */
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { setSubscriberEmail, clearSubscriberEmail } from '@/services/quickref-api'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const loading = ref(true)
const sessionRevoked = ref(false)

function getSessionId(): string | null {
  return localStorage.getItem('quickref_session_id')
}

function setSessionId(id: string): void {
  localStorage.setItem('quickref_session_id', id)
}

function clearSessionId(): void {
  localStorage.removeItem('quickref_session_id')
}

export function useAuth() {
  const isLoggedIn = computed(() => !!user.value && !sessionRevoked.value)
  const email = computed(() => user.value?.email ?? null)

  onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null

    if (user.value?.email) {
      setSubscriberEmail(user.value.email)
    }

    loading.value = false

    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user ?? null

      if (event === 'SIGNED_IN' && user.value?.email) {
        // Générer un nouveau session_id et l'enregistrer en base
        const newSessionId = crypto.randomUUID()
        setSessionId(newSessionId)
        setSubscriberEmail(user.value.email)

        // Mettre à jour la session active en base (écrase l'ancienne)
        await supabase.functions.invoke('session-update', {
          body: {
            email: user.value.email,
            session_id: newSessionId,
          },
        })

        sessionRevoked.value = false
      } else if (event === 'SIGNED_OUT') {
        clearSubscriberEmail()
        clearSessionId()
        sessionRevoked.value = false
      }
    })
  })

  async function sendMagicLink(emailAddress: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.signInWithOtp({
      email: emailAddress,
      options: {
        emailRedirectTo: 'https://quickref.securionis.com/chat',
      },
    })

    if (error) {
      return { error: error.message }
    }
    return {}
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    clearSubscriberEmail()
    clearSessionId()
  }

  /**
   * Appelé quand l'API retourne session_revoked → une autre connexion a pris le relais
   */
  function handleSessionRevoked() {
    sessionRevoked.value = true
    clearSubscriberEmail()
    clearSessionId()
  }

  return {
    user,
    email,
    isLoggedIn,
    loading,
    sessionRevoked,
    sendMagicLink,
    logout,
    handleSessionRevoked,
    getSessionId,
  }
}
