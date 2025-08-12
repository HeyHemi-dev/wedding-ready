'use client'

import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { SupplierSearchGetRequestParams, SupplierSearchGetResponseBody } from '@/app/api/suppliers/search/route'
import { buildQueryParams } from '@/utils/api-helpers'
import { DEFAULT_STALE_TIME } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'

import { useDebounce } from './use-debounce'
import { supplierKeys } from '../_types/queryKeys'
import { SupplierSearchResult } from '../_types/suppliers'

export function useSupplierSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const { data } = useQuery({
    queryKey: supplierKeys.search(debouncedSearchQuery),
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
    data,
  }
}

async function fetchSuppliersForSearch(query: string): Promise<SupplierSearchResult[]> {
  const getSuppliersParams: SupplierSearchGetRequestParams = { q: query }
  const queryParams = buildQueryParams(getSuppliersParams)

  const { data, error } = await tryCatchFetch<SupplierSearchGetResponseBody>(`/api/suppliers/search${queryParams}`)
  if (error) throw error
  return data
}
