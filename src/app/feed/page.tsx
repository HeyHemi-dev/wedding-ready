import { Suspense } from 'react'

import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/app/_types/keys'
import { FeedGetResponse } from '@/app/api/feed/types'
import { TileListSkeleton } from '@/components/tiles/tile-list'
import { Section } from '@/components/ui/section'
import { tileOperations } from '@/operations/tile-operations'
import { requireVerifiedAuth } from '@/utils/auth'
import { DEFAULT_STALE_TIME, FEED_PAGE_SIZE } from '@/utils/constants'
import { setTilesSaveStateCache } from '@/utils/usequery-helpers'

import { FeedClient } from './feed-client'

export default async function Page() {
  const { authUserId } = await requireVerifiedAuth()

  const queryClient = new QueryClient()
  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.feed(authUserId),
    queryFn: async () => {
      const page = await tileOperations.getFeedForUser(authUserId, FEED_PAGE_SIZE)

      setTilesSaveStateCache(queryClient, page.tiles, authUserId)

      return page
    },
    getNextPageParam: (lastPage: FeedGetResponse) => {
      // Pagination is handled by the server.
      // Return any truthy value to enable next page.
      return lastPage.hasNextPage ? 1 : null
    },
    initialPageParam: 1,
    staleTime: DEFAULT_STALE_TIME,
  })

  return (
    <Section className="min-h-svh-minus-header pt-0">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<TileListSkeleton />}>
          <FeedClient authUserId={authUserId} />
        </Suspense>
      </HydrationBoundary>
    </Section>
  )
}
