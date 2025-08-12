'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { setTilesSaveStateCache } from '@/app/_hooks/use-tile-saved-state'
import { tileKeys } from '@/app/_types/queryKeys'
import { SupplierTilesGetRequestParams, SupplierTilesGetResponseBody } from '@/app/api/suppliers/[id]/tiles/route'
import { buildQueryParams } from '@/utils/api-helpers'
import { DEFAULT_STALE_TIME } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'
import { TileListItem } from '../_types/tiles'

export function useSupplierTiles({ supplierId, authUserId }: { supplierId: string; authUserId: string | null }) {
  const queryClient = useQueryClient()

  const supplierTilesQuery = useQuery({
    queryKey: tileKeys.supplierTiles(supplierId),
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
  const getTilesParams: SupplierTilesGetRequestParams = { authUserId }
  const queryParams = buildQueryParams(getTilesParams)

  const { data, error } = await tryCatchFetch<SupplierTilesGetResponseBody>(`/api/suppliers/${supplierId}/tiles${queryParams}`)

  if (error) {
    throw error
  }

  return data
}
