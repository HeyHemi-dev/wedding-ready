'use server'

import { UserDetailModel } from '@/models/user'
import { User, makeUser } from '@/models/types'
import { unstable_cache } from 'next/cache'
import { getAuthenticatedUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

const USER_CACHE_DURATION = 60 * 15 // time in seconds

enum UserFetchErrorCode {
  NOT_AUTHENTICATED = 'Not authenticated',
  USER_NOT_FOUND = 'User not found',
  DATABASE_ERROR = 'Database error',
}
type UserFetchError = {
  code: UserFetchErrorCode
  message?: string
}

/**
 * Server-side function uses the current authenticated userId to get their user details from the database.
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
  const { data: userId, error } = await tryCatch(getAuthenticatedUserId())

  if (error || !userId) {
    const authError: UserFetchError = {
      code: UserFetchErrorCode.NOT_AUTHENTICATED,
      message: 'No authenticated user ID found in request',
    }
    console.error('[getCurrentUser]', authError)
    return null
  }

  const user = await unstable_cache(
    async () => {
      const { data: userDetail, error } = await tryCatch(UserDetailModel.getById(userId))

      if (error) {
        const userError: UserFetchError = {
          code: UserFetchErrorCode.DATABASE_ERROR,
          message: `Failed to fetch user details from database`,
        }
        console.error('[getCurrentUser]', userError)
        return null
      }

      if (!userDetail) {
        const userError: UserFetchError = {
          code: UserFetchErrorCode.USER_NOT_FOUND,
          message: `User details missing for user: ${userId}`,
        }
        console.error('[getCurrentUser]', userError)
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
