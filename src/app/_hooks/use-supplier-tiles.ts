'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { tileKeys } from '@/src/app/_hooks/queryKeys'
import { SupplierTilesGetRequestParams, SupplierTilesGetResponseBody } from '@/src/app/api/suppliers/[id]/tiles/route'
import { buildQueryParams } from '@/utils/api-helpers'
import { DEFAULT_STALE_TIME } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'

import { setTilesSaveStateCache } from './use-tile-saved-state'

export function useSupplierTiles(supplierId: string, authUserId?: string) {
  const queryClient = useQueryClient()

  const supplierTilesQuery = useQuery({
    queryKey: tileKeys.supplierTiles(supplierId),
    queryFn: async () => {
      const data = await fetchTilesForSupplier(supplierId, authUserId)

      if (authUserId) {
        setTilesSaveStateCache(queryClient, data, authUserId)
      }

      return data
    },
    staleTime: DEFAULT_STALE_TIME,
  })

  return supplierTilesQuery
}

async function fetchTilesForSupplier(supplierId: string, authUserId?: string): Promise<SupplierTilesGetResponseBody> {
  const getTilesParams: SupplierTilesGetRequestParams = { authUserId }
  const queryParams = buildQueryParams(getTilesParams)

  const { data, error } = await tryCatchFetch<SupplierTilesGetResponseBody>(`/api/suppliers/${supplierId}/tiles${queryParams}`)

  if (error) {
    throw error
  }

  return data
}
