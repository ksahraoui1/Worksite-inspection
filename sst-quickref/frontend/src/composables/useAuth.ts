/**
 * Composable d'authentification — Magic link via Supabase Auth
 */
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { setSubscriberEmail, clearSubscriberEmail } from '@/services/quickref-api'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const loading = ref(true)

export function useAuth() {
  const isLoggedIn = computed(() => !!user.value)
  const email = computed(() => user.value?.email ?? null)

  onMounted(async () => {
    // Récupérer la session existante
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null

    if (user.value?.email) {
      setSubscriberEmail(user.value.email)
    }

    loading.value = false

    // Écouter les changements d'auth (magic link callback)
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null

      if (user.value?.email) {
        setSubscriberEmail(user.value.email)
      } else {
        clearSubscriberEmail()
      }
    })
  })

  /**
   * Envoyer un magic link par email
   */
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

  /**
   * Déconnexion
   */
  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    clearSubscriberEmail()
  }

  return {
    user,
    email,
    isLoggedIn,
    loading,
    sendMagicLink,
    logout,
  }
}
