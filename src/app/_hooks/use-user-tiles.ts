'use client'

import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { setTilesSaveStateCache } from '@/app/_hooks/use-tile-saved-state'
import { queryKeys } from '@/app/_types/keys'
import { UserTilesGetRequestParams, UserTilesGetResponseBody } from '@/app/api/users/[id]/tiles/route'
import { buildQueryParams } from '@/utils/api-helpers'
import { DEFAULT_STALE_TIME } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'

import { TileListItem } from '../_types/tiles'

export function useUserTiles(userId: string, authUserId: string | null) {
  const queryClient = useQueryClient()

  const userTilesQuery = useSuspenseQuery({
    queryKey: queryKeys.userTiles(userId),
    queryFn: async () => {
      const data = await fetchTilesForUser(userId, authUserId ?? undefined)

      if (authUserId) {
        setTilesSaveStateCache(queryClient, data, authUserId)
      }

      return data
    },
    staleTime: DEFAULT_STALE_TIME,
  })

  return userTilesQuery
}

async function fetchTilesForUser(userId: string, authUserId?: string): Promise<TileListItem[]> {
  const getTilesParams: UserTilesGetRequestParams = { authUserId }
  const queryParams = buildQueryParams(getTilesParams)

  const { data, error } = await tryCatchFetch<UserTilesGetResponseBody>(`/api/users/${userId}/tiles${queryParams}`)

  if (error) {
    throw error
  }

  return data
}
