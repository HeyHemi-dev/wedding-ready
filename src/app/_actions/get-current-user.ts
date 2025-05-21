'use server'

import { unstable_cache } from 'next/cache'

import { User, makeUser } from '@/models/types'
import { UserDetailModel } from '@/models/user'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

const USER_CACHE_DURATION = 60 * 15 // time in seconds

enum UserFetchErrorCode {
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
 * @important Use getAuthUserId() instead if you don't need the user details.
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
  const userId = await getAuthUserId()

  if (!userId) {
    return null
  }

  const user = await unstable_cache(
    async () => {
      const { data: userDetail, error } = await tryCatch(UserDetailModel.getById(userId))

      if (error) {
        const databaseError: UserFetchError = {
          code: UserFetchErrorCode.DATABASE_ERROR,
          message: error.message,
        }
        console.error(databaseError)
        return null
      }

      if (!userDetail) {
        const userError: UserFetchError = {
          code: UserFetchErrorCode.USER_NOT_FOUND,
          message: `User details missing for user: ${userId}`,
        }
        console.error(userError)
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
