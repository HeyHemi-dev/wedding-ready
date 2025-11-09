'use client'

import { useUserTiles } from '@/app/_hooks/use-user-tiles'
import { noTiles, TileList } from '@/components/tiles/tile-list'
import { User } from '@/app/_types/users'

export function UserTiles({ user, authUserId }: { user: User; authUserId: string | null }) {
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
