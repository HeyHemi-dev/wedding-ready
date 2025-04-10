'use client'

import { noTiles, TileList, TileListSkeleton } from '@/components/tiles/tile-list'
import { useUserTiles } from '@/hooks/use-user-tiles'
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
      message: `${user.displayName} has no tiles`,
      cta: {
        text: 'Add a tile',
        redirect: `/u/${user.handle}/new`,
        show: authUserId === user.id,
      },
    })
  }

  return <TileList tiles={tiles} authUserId={user?.id} />
}
