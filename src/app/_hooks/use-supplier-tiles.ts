'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { setTilesSaveStateCache } from '@/utils/usequery-helpers'
import { queryKeys } from '@/app/_types/keys'
import { SupplierTilesGetRequest, SupplierTilesGetResponse } from '@/app/api/suppliers/[id]/tiles/types'
import { buildQueryParams } from '@/utils/api-helpers'
import { DEFAULT_STALE_TIME } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'

import { TileListItem } from '../_types/tiles'

export function useSupplierTiles({ supplierId, authUserId }: { supplierId: string; authUserId: string | null }) {
  const queryClient = useQueryClient()

  const supplierTilesQuery = useQuery({
    queryKey: queryKeys.supplierTiles(supplierId),
    queryFn: async () => {
      const data = await fetchTilesForSupplier(supplierId, authUserId ?? undefined)

      if (authUserId) {
        setTilesSaveStateCache(queryClient, data, authUserId)
      }

      return data
    },
    staleTime: DEFAULT_STALE_TIME,
  })

  return supplierTilesQuery
}

async function fetchTilesForSupplier(supplierId: string, authUserId: string | undefined): Promise<TileListItem[]> {
  const getTilesParams: SupplierTilesGetRequest = { authUserId }
  const queryParams = buildQueryParams(getTilesParams)

  const { data, error } = await tryCatchFetch<SupplierTilesGetResponse>(`/api/suppliers/${supplierId}/tiles${queryParams}`)

  if (error) {
    throw error
  }

  return data
}
