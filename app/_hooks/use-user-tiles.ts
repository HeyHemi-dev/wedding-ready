'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { tileKeys } from '@/app/_hooks/queryKeys'
import { UserTilesGetRequestParams, UserTilesGetResponseBody } from '@/app/api/users/[id]/tiles/route'
import { buildQueryParams } from '@/utils/api-helpers'
import { DEFAULT_STALE_TIME } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'

import { setTilesSaveStateCache } from './use-tile-saved-state'


export function useUserTiles(userId: string, authUserId?: string) {
  const queryClient = useQueryClient()

  const userTilesQuery = useQuery({
    queryKey: tileKeys.userTiles(userId),
    queryFn: async () => {
      const data = await fetchTilesForUser(userId, authUserId)

      if (authUserId) {
        setTilesSaveStateCache(queryClient, data, authUserId)
      }

      return data
    },
    staleTime: DEFAULT_STALE_TIME,
  })

  return userTilesQuery
}

async function fetchTilesForUser(userId: string, authUserId?: string): Promise<UserTilesGetResponseBody> {
  const getTilesParams: UserTilesGetRequestParams = { authUserId }
  const queryParams = buildQueryParams(getTilesParams)

  const { data, error } = await tryCatchFetch<UserTilesGetResponseBody>(`/api/users/${userId}/tiles${queryParams}`)

  if (error) {
    throw error
  }

  return data
}
