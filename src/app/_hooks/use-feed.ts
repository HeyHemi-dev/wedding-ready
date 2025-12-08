'use client'

import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query'

import { setTilesSaveStateCache } from '@/app/_hooks/use-tile-saved-state'
import { queryKeys } from '@/app/_types/keys'
import { FeedGetResponseBody } from '@/app/api/feed/route'
import { buildQueryParams } from '@/utils/api-helpers'
import { DEFAULT_STALE_TIME } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'

import type { TileListItem } from '@/app/_types/tiles'

const PAGE_SIZE = 10

export function useFeed(authUserId: string) {
  const queryClient = useQueryClient()

  const feedQuery = useSuspenseInfiniteQuery({
    queryKey: queryKeys.feed(authUserId),
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const page = await fetchFeedPage({ pageParam })

      setTilesSaveStateCache(queryClient, page.tiles, authUserId)

      return page
    },
    getNextPageParam: (lastPage: FeedGetResponseBody, allPages) => {
      return lastPage.hasNextPage ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: DEFAULT_STALE_TIME,
  })

  const tiles: TileListItem[] = feedQuery.data.pages.flatMap((page) => page.tiles)
  const hasNextPage = feedQuery.data.pages[feedQuery.data.pages.length - 1]?.hasNextPage ?? false

  return {
    tiles,
    fetchNextPage: feedQuery.fetchNextPage,
    hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
  }
}

async function fetchFeedPage({ pageParam }: { pageParam: number }): Promise<FeedGetResponseBody> {
  const queryParams = buildQueryParams({ pageSize: PAGE_SIZE.toString() })

  const { data, error } = await tryCatchFetch<FeedGetResponseBody>(`/api/feed${queryParams}`)

  if (error) {
    throw error
  }

  return data
}
