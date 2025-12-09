'use client'

import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query'

import { setTilesSaveStateCache } from '@/app/_hooks/use-tile-saved-state'
import { queryKeys } from '@/app/_types/keys'
import type { TileListItem } from '@/app/_types/tiles'
import { FeedGetRequest, FeedGetResponse } from '@/app/api/feed/route'
import { buildQueryParams } from '@/utils/api-helpers'
import { DEFAULT_STALE_TIME , FEED_PAGE_SIZE } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'


export function useFeed(authUserId: string) {
  const queryClient = useQueryClient()

  const feedQuery = useSuspenseInfiniteQuery({
    queryKey: queryKeys.feed(authUserId),
    queryFn: async () => {
      const page = await fetchFeedPage()

      setTilesSaveStateCache(queryClient, page.tiles, authUserId)

      return page
    },
    getNextPageParam: (lastPage: FeedGetResponse) => {
      return lastPage.hasNextPage ? 1 : null
    },
    initialPageParam: 1,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  })

  const tiles: TileListItem[] = feedQuery.data.pages.flatMap((page) => page.tiles)

  return {
    tiles,
    fetchNextPage: feedQuery.fetchNextPage,
    hasNextPage: feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
  }
}

async function fetchFeedPage(): Promise<FeedGetResponse> {
  const getFeedParams: FeedGetRequest = { pageSize: FEED_PAGE_SIZE }
  const queryParams = buildQueryParams({ ...getFeedParams, pageSize: getFeedParams.pageSize.toString() })

  const { data, error } = await tryCatchFetch<FeedGetResponse>(`/api/feed${queryParams}`)

  if (error) {
    throw error
  }

  return data
}
