'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { TilesGetRequestParams, TilesGetResponseBody } from '@/app/api/suppliers/[id]/tiles/route'
import { buildQueryParams } from '@/utils/api-helpers'
import { tryCatchFetch } from '@/utils/try-catch'
import { tileKeys } from '@/hooks/queryKeys'

export function useSupplierTiles(supplierId: string, userId?: string) {
  const queryClient = useQueryClient()

  const supplierTilesQuery = useQuery({
    queryKey: tileKeys.supplierTiles(supplierId, userId),
    queryFn: () => fetchTilesForSupplier(supplierId, userId),
    staleTime: Infinity,
  })

  useEffect(() => {
    if (userId && supplierTilesQuery.data) {
      supplierTilesQuery.data.forEach((tile) => {
        console.log('setting savedState cache for tile', tile.id)
        queryClient.setQueryData(tileKeys.saveState(tile.id, userId), { userId, tileId: tile.id, isSaved: tile.isSaved })
      })
    }
  }, [userId, supplierTilesQuery.data, queryClient])

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
