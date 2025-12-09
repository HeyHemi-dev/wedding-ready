'use client'

import { useAuthUser } from '@/app/_hooks/use-auth-user'
import { useFeed } from '@/app/_hooks/use-feed'
import { useInfiniteScroll } from '@/app/_hooks/use-infinite-scroll'
import { TileList, TileListSkeleton, noTiles } from '@/components/tiles/tile-list'

export function FeedClient() {
  const { data: authUser } = useAuthUser()

  if (!authUser) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-sibling">
        <p className="text-muted-foreground">Please sign in to view your feed</p>
      </div>
    )
  }

  const authUserId = authUser.id

  const { tiles, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(authUserId)
  const { sentinelRef } = useInfiniteScroll({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) fetchNextPage()
    },
    disabled: !hasNextPage || isFetchingNextPage,
  })

  if (tiles.length === 0) {
    return noTiles({
      message: 'No fresh tiles',
      cta: {
        text: 'Explore suppliers',
        redirect: '/find-suppliers',
        show: true,
      },
    })
  }

  return (
    <>
      <TileList tiles={tiles} authUserId={authUserId} />
      <div ref={sentinelRef} />
      {isFetchingNextPage && <TileListSkeleton />}
    </>
  )
}
