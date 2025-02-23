'use server'

import { createClient } from '@/utils/supabase/server'
import type { User } from '@supabase/supabase-js'

/**
 * A server-side function that retrieves the current authenticated user.
 * This function must be called from a Server Component or server action.
 *
 * @returns {Promise<User | null>} A promise that resolves to:
 *   - User object if authenticated
 *   - null if not authenticated
 *
 * @example
 * ```tsx
 * // In a Server Component
 * async function ProfilePage() {
 *   const user = await useCurrentUser()
 *
 *   if (!user) return <div>Please log in</div>
 *
 *   return (
 *     <div>
 *       <h1>Profile</h1>
 *       <p>Email: {user.email}</p>
 *       <p>User ID: {user.id}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export async function useCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return user
}
