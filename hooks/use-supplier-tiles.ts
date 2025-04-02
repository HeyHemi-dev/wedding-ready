'use client'

import { useQuery } from '@tanstack/react-query'
import { TilesGetRequestParams, TilesGetResponseBody } from '@/app/api/suppliers/[id]/tiles/route'
import { buildQueryParams } from '@/utils/api-helpers'
import { tryCatch } from '@/utils/try-catch'

export function useSupplierTiles(supplierId: string, userId?: string) {
  return useQuery({
    queryKey: ['tiles', supplierId, userId],
    queryFn: () => fetchTilesForSupplier(supplierId, userId),
  })
}

async function fetchTilesForSupplier(supplierId: string, userId?: string) {
  const getTilesParams: TilesGetRequestParams = { userId }
  const queryParams = buildQueryParams(getTilesParams)
  const res = await fetch(`/api/suppliers/${supplierId}/tiles${queryParams}`)

  if (!res.ok) {
    const { data: errorData, error } = await tryCatch(res.json())

    // If we can't parse as JSON, it might be an auth redirect
    if (error && (res.status === 401 || res.status === 403)) {
      throw new Error('Please sign in to view tiles')
    }

    throw new Error(errorData?.message || `Failed to fetch tiles: ${res.statusText}`)
  }

  const tiles: TilesGetResponseBody = await res.json()
  return tiles
}
