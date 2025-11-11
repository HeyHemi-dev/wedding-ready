import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { userKeys } from '@/app/_types/queryKeys'
import { User } from '@/app/_types/users'
import { AuthMeResponseBody } from '@/app/api/auth/current/route'
import { AUTH_STALE_TIME } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'
import { browserSupabase } from '@/utils/supabase/client'
import { useEffect } from 'react'

async function fetchAuthUser(): Promise<User | null> {
  const { data, error } = await tryCatchFetch<AuthMeResponseBody>(`/api/auth/current`)
  if (error) return null
  return data
}

export function useAuthUser() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const { data: subscription } = browserSupabase.auth.onAuthStateChange(async () => {
      // Blow away the cached value so the next render suspends and refetches
      queryClient.removeQueries({ queryKey: userKeys.authUser() })
    })

    return () => subscription.subscription.unsubscribe()
  }, [queryClient])

  return useSuspenseQuery({
    queryKey: userKeys.authUser(),
    queryFn: fetchAuthUser,
    staleTime: AUTH_STALE_TIME,
    retry: false,
  })
}
