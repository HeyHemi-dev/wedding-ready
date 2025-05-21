'use client'

import { useUserTiles } from '@/app/_hooks/use-user-tiles'
import { noTiles, TileList, TileListSkeleton } from '@/components/tiles/tile-list'
import * as t from '@/models/types'

export function UserTiles({ user, authUserId }: { user: t.User; authUserId?: string }) {
  const { data: tiles, isLoading, isError, error } = useUserTiles(user.id, authUserId)

  if (isLoading) {
    return <TileListSkeleton />
  }

  if (isError) {
    return noTiles({ message: `${error.message}` })
  }

  if (!tiles || tiles.length === 0) {
    return noTiles({
      message: `${user.displayName} has no saved tiles`,
      cta: {
        text: 'Start exploring',
        redirect: `/feed`,
        show: authUserId === user.id,
      },
    })
  }

  return <TileList tiles={tiles} authUserId={authUserId} />
}
