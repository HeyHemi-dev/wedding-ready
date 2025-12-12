import { useEffect } from 'react'

import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { queryKeys } from '@/app/_types/keys'
import { User } from '@/app/_types/users'
import { AuthMeResponseBody } from '@/app/api/auth/current/route'
import { AUTH_STALE_TIME } from '@/utils/constants'
import { browserSupabase } from '@/utils/supabase/client'
import { tryCatchFetch } from '@/utils/try-catch'

export function useAuthUser() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const { data: subscription } = browserSupabase.auth.onAuthStateChange(async (event) => {
      // Invalidate the cached value so the next render suspends and refetches
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        queryClient.invalidateQueries({ queryKey: queryKeys.authUser() })
      }
    })

    return () => subscription.subscription.unsubscribe()
  }, [queryClient])

  return useSuspenseQuery({
    queryKey: queryKeys.authUser(),
    queryFn: fetchAuthUser,
    staleTime: AUTH_STALE_TIME,
    retry: false,
  })
}

async function fetchAuthUser(): Promise<User | null> {
  const { data, error } = await tryCatchFetch<AuthMeResponseBody>(`/api/auth/current`)
  if (error) return null
  return data
}
