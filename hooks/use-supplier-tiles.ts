'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { TilesGetRequestParams, TilesGetResponseBody } from '@/app/api/suppliers/[id]/tiles/route'
import { buildQueryParams } from '@/utils/api-helpers'
import { tryCatchFetch } from '@/utils/try-catch'
import { tileKeys } from '@/hooks/queryKeys'

export function useSupplierTiles(supplierId: string, userId?: string) {
  const queryClient = useQueryClient()

  const supplierTilesQuery = useQuery({
    queryKey: tileKeys.supplierTiles(supplierId, userId),
    queryFn: () => fetchTilesForSupplier(supplierId, userId),
  })

  if (userId && supplierTilesQuery.data) {
    for (const tile of supplierTilesQuery.data) {
      queryClient.setQueryData(tileKeys.saveState(tile.id, userId), tile.isSaved ?? false)
    }
  }

  return supplierTilesQuery
}

async function fetchTilesForSupplier(supplierId: string, userId?: string): Promise<TilesGetResponseBody> {
  const getTilesParams: TilesGetRequestParams = { userId }
  const queryParams = buildQueryParams(getTilesParams)

  const { data, error } = await tryCatchFetch<TilesGetResponseBody>(`/api/suppliers/${supplierId}/tiles${queryParams}`)

  if (error) {
    throw error
  }

  return data
}
