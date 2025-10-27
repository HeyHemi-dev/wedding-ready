import { useSuspenseQuery } from '@tanstack/react-query'

import { userKeys } from '@/app/_types/queryKeys'
import { User, AuthUserId } from '@/app/_types/users'
import { AuthMeResponseBody } from '@/app/api/auth/current/route'
import { AUTH_STALE_TIME } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'

async function fetchAuthUser(): Promise<User | null> {
  const { data, error } = await tryCatchFetch<AuthMeResponseBody>(`/api/auth/current`)
  if (error) return null
  return data
}

export function useAuthUser(authUserId: AuthUserId) {
  return useSuspenseQuery({
    queryKey: userKeys.authUser(authUserId),
    queryFn: fetchAuthUser,
    staleTime: AUTH_STALE_TIME,
    retry: false,
  })
}
