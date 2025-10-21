'use client'

import { useUserTiles } from '@/app/_hooks/use-user-tiles'
import { noTiles, TileList, TileListSkeleton } from '@/components/tiles/tile-list'
import * as t from '@/models/types'

export function UserTiles({ user, authUserId }: { user: t.User; authUserId: string | null }) {
  const { data: tiles } = useUserTiles(user.id, authUserId)

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
