import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for handling user authentication and data access.
 * Uses the anon key and includes cookie handling for maintaining user sessions.
 * Must be used with 'await' since it accesses Next.js cookie store.
 *
 * @example
 * const supabase = await createClient()
 * const { data, error } = await supabase.auth.getUser()
 */
export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.error(error)
        }
      },
    },
  })
}

/**
 * Creates a Supabase admin client with elevated privileges for administrative tasks.
 * Uses the service role key and disables session handling.
 * Does not require 'await' since it doesn't handle cookies/sessions.
 *
 * @example
 * const supabaseAdmin = createAdminClient()
 * await supabaseAdmin.auth.admin.deleteUser(userId)
 *
 * @security This client has full database access - use only in server-side code
 * and only for admin operations like user management
 */
export const createAdminClient = () => {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
