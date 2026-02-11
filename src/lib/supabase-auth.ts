import { useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/clerk-react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Creates a Supabase client that injects the Clerk JWT into every request.
 *
 * How it works:
 * 1. Clerk issues a JWT using the "supabase" template (configured in Clerk Dashboard)
 * 2. The JWT contains { sub: <clerk_user_id>, role: "authenticated" }
 * 3. Supabase verifies the JWT and maps `sub` → `auth.uid()`
 * 4. RLS policies that check `auth.uid()` now work for Clerk-authenticated users
 *
 * When the user is signed out, `session` is null, no token is attached,
 * and the anon key provides public read access only.
 *
 * Usage:
 *   const supabase = useSupabaseClient()
 *   const { data } = await supabase.from('provider_profiles').select('*')
 */
export function useSupabaseClient() {
  const { session } = useSession()

  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) return null

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await session?.getToken({ template: 'supabase' })
          const headers = new Headers(options?.headers)
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`)
          }
          return fetch(url, { ...options, headers })
        },
      },
    })
  }, [session])

  return supabase
}
