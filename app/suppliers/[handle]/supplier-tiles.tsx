'use client'

import { noTiles, TileList, TileListSkeleton } from '@/components/tiles/tile-list'

import { useSupplierTiles } from '@/hooks/use-supplier-tiles'
import { SupplierWithUsers, User } from '@/models/types'

export function SupplierTiles({ supplier, user }: { supplier: SupplierWithUsers; user?: User }) {
  const isSupplierUser = supplier?.users.some((u) => u.userId === user?.id)
  const { data: tiles, isLoading, isError, error } = useSupplierTiles(supplier.id, user?.id)

  if (isLoading) {
    return <TileListSkeleton />
  }

  if (isError) {
    return noTiles({ message: `Error loading tiles: ${error.message}` })
  }

  if (!tiles || tiles.length === 0) {
    return noTiles({
      message: `${supplier.name} has no tiles`,
      cta: { text: 'Add a tile', redirect: `/suppliers/${supplier.handle}/new`, show: isSupplierUser },
    })
  }

  return <TileList tiles={tiles} />
}
