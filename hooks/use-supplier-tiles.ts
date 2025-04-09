'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SupplierTilesGetRequestParams, SupplierTilesGetResponseBody } from '@/app/api/suppliers/[id]/tiles/route'
import { buildQueryParams } from '@/utils/api-helpers'
import { tryCatchFetch } from '@/utils/try-catch'
import { tileKeys } from '@/hooks/queryKeys'
import { setTilesSaveStateCache } from './use-tile-saved-state'
import { DEFAULT_STALE_TIME } from '@/utils/constants'

export function useSupplierTiles(supplierId: string, authUserId?: string) {
  const queryClient = useQueryClient()

  const supplierTilesQuery = useQuery({
    queryKey: tileKeys.supplierTiles(supplierId, authUserId),
    queryFn: async () => {
      console.log('Fetching supplier tiles...')
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
