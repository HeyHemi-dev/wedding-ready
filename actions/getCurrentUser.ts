'use server'

import UserDetailActions from '@/actions/userActions'
import { createClient } from '@/utils/supabase/server'
import type { UserWithDetail } from '@/models/Users'
import { makeUserWithDetail } from '@/models/Users'

/**
 * A server-side function that retrieves the current authenticated user and their extended user details.
 * This function must be called from a Server Component or server action.
 *
 * @returns UserWithDetail object if authenticated
 * @returns null if not authenticated
 *
 * @example
 * ```tsx
 * // Server Component
 * async function ProfilePage() {
 *   const user = await getCurrentUser()
 *
 *   if (!user) return <div>Please log in</div>
 *
 *   return (
 *     <div>
 *       <h1>Profile</h1>
 *       <p>Email: {user.email}</p>
 *       <p>User ID: {user.id}</p>
 *       <img src={user.extended.avatarUrl} alt={user.name} />
 *     </div>
 *   )
 * }
 * ```
 */
export async function getCurrentUser(): Promise<UserWithDetail | null> {
  console.log('getCurrentUser called')
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (!user) return null

  const userDetail = await UserDetailActions.getById(user.id)

  if (!userDetail) throw new Error(`User details missing for user: ${user.id}`)

  return makeUserWithDetail(user, userDetail)
}
