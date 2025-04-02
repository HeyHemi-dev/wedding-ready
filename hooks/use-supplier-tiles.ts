'use client'

import { useQuery } from '@tanstack/react-query'
import { TilesGetRequestParams, TilesGetResponseBody } from '@/app/api/tiles/route'
import { buildQueryParams } from '@/utils/api-helpers'

export function useSupplierTiles(supplierId: string, userId?: string) {
  return useQuery({
    queryKey: ['tiles', supplierId, userId],
    queryFn: () => fetchTilesForSupplier(supplierId, userId),
  })
}

async function fetchTilesForSupplier(supplierId: string, userId?: string) {
  const getTilesParams: TilesGetRequestParams = { supplierId, userId }
  const queryParams = buildQueryParams(getTilesParams)
  const res = await fetch(`/api/tiles${queryParams}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch tiles: ${res.statusText}`)
  }
  const tiles: TilesGetResponseBody = await res.json()
  return tiles
}
