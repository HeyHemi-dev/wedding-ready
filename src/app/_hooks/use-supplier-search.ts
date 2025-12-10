'use client'

import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { SupplierSearchGetRequest, SupplierSearchGetResponse } from '@/app/api/suppliers/search/types'
import { buildQueryParams } from '@/utils/api-helpers'
import { DEFAULT_STALE_TIME } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'

import { useDebounce } from './use-debounce'
import { queryKeys } from '../_types/keys'
import { SupplierSearchResult } from '../_types/suppliers'

export function useSupplierSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const query = useQuery({
    queryKey: queryKeys.supplierSearch(debouncedSearchQuery),
    queryFn: async () => {
      if (!debouncedSearchQuery.trim()) return []
      return fetchSuppliersForSearch(debouncedSearchQuery)
    },
    enabled: searchQuery.trim().length > 0,
    staleTime: DEFAULT_STALE_TIME,
  })

  return {
    searchQuery,
    setSearchQuery,
    ...query,
  }
}

async function fetchSuppliersForSearch(query: string): Promise<SupplierSearchResult[]> {
  const getSuppliersParams: SupplierSearchGetRequest = { q: query }
  const queryParams = buildQueryParams(getSuppliersParams)

  const { data, error } = await tryCatchFetch<SupplierSearchGetResponse>(`/api/suppliers/search${queryParams}`)
  if (error) throw error
  return data
}
