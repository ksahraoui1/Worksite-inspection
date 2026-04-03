/**
 * T023: JWT auth middleware
 * Extracts and verifies Authorization Bearer token via Supabase.
 * Returns user type: inspector, admin, or anonymous (fallback).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export type UserType = 'inspector' | 'admin' | 'anonymous'

export interface AuthResult {
  authenticated: boolean
  userType: UserType
}

/**
 * Validates the Authorization header from the incoming request.
 * If no token or invalid token, returns anonymous (no error thrown).
 */
export async function validateAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, userType: 'anonymous' }
  }

  const token = authHeader.replace('Bearer ', '')

  if (!token || token.trim().length === 0) {
    return { authenticated: false, userType: 'anonymous' }
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { authenticated: false, userType: 'anonymous' }
    }

    // Determine user type from user metadata or role
    const role = user.user_metadata?.role ?? user.app_metadata?.role ?? 'inspector'

    const userType: UserType = role === 'admin' ? 'admin' : 'inspector'

    return { authenticated: true, userType }
  } catch (error) {
    console.error('Auth validation error:', error)
    return { authenticated: false, userType: 'anonymous' }
  }
}
