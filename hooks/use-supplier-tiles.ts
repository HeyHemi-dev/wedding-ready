'use client'

import { useQuery } from '@tanstack/react-query'
import { TilesGetRequestParams, TilesGetResponseBody } from '@/app/api/suppliers/[id]/tiles/route'
import { buildQueryParams } from '@/utils/api-helpers'
import { tryCatchFetch } from '@/utils/try-catch'

export function useSupplierTiles(supplierId: string, userId?: string) {
  return useQuery({
    queryKey: ['tiles', supplierId, userId],
    queryFn: () => fetchTilesForSupplier(supplierId, userId),
  })
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
