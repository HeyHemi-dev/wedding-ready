'use server'

import { UserDetailModel } from '@/models/user'
import { User, makeUser } from '@/models/types'
import { unstable_cache } from 'next/cache'
import { getAuthenticatedUserId } from '@/utils/auth'

const USER_CACHE_DURATION = 60 * 15 // time in seconds

/**
 * A server-side function that retrieves the authenticated user's id from middleware and returns their user details from the database.
 * The result is cached based on the user ID from the request header.
 * This function must be called from a Server Component or server action.
 *
 * @important Use getAuthenticatedUserId() instead if you don't need the user details.
 *
 * @returns UserDetailRaw object if authenticated
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
 *       <p>Handle: {user.handle}</p>
 *       <img src={user.avatarUrl} alt={user.displayName} />
 *     </div>
 *   )
 * }
 * ```
 */
export async function getCurrentUser(): Promise<User | null> {
  const userId = await getAuthenticatedUserId()

  if (!userId) return null

  const user = unstable_cache(
    async () => {
      const userDetail = await UserDetailModel.getById(userId)
      if (!userDetail) {
        console.error(`User details missing for user: ${userId}`)
        return null
      }
      return makeUser(userDetail)
    },
    [`user-${userId}`],
    {
      revalidate: USER_CACHE_DURATION,
      tags: [`user-${userId}`, 'auth'], // auth tag for global cache invalidation
    }
  )()

  return user
}
