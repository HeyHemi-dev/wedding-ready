import { Suspense } from 'react'

import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { redirect } from 'next/navigation'

import { queryKeys } from '@/app/_types/keys'
import { FeedGetResponseBody } from '@/app/api/feed/route'
import { TileListSkeleton } from '@/components/tiles/tile-list'
import { Section } from '@/components/ui/section'
import { getAuthUserId } from '@/utils/auth'

import { FeedClient } from './feed-client'
import { tileOperations } from '@/operations/tile-operations'

const PAGE_SIZE = 10

export default async function Page() {
  const authUserId = await getAuthUserId()

  if (!authUserId) {
    redirect('/sign-in')
  }

  const queryClient = new QueryClient()
  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.feed(authUserId),
    queryFn: () => tileOperations.getFeedForUser(authUserId, { pageSize: PAGE_SIZE }),
    getNextPageParam: (lastPage: FeedGetResponseBody) => {
      return lastPage.hasNextPage ? 1 : null
    },
    initialPageParam: 1,
  })

  return (
    <Section>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<TileListSkeleton />}>
          <FeedClient />
        </Suspense>
      </HydrationBoundary>
    </Section>
  )
}
