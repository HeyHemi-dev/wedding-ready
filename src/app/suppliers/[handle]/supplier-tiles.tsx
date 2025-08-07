'use client'

import { useSupplierTiles } from '@/app/_hooks/use-supplier-tiles'
import { noTiles, TileList, TileListSkeleton } from '@/components/tiles/tile-list'
import { SupplierWithUsers } from '@/models/types'

export function SupplierTiles({ supplier, authUserId }: { supplier: SupplierWithUsers; authUserId: string | null }) {
  const isSupplierUser = supplier?.users.some((u) => u.userId === authUserId)
  const { data: tiles, isLoading, isError, error } = useSupplierTiles({ supplierId: supplier.id, authUserId })

  if (isLoading) {
    return <TileListSkeleton />
  }

  if (isError) {
    return noTiles({ message: `Error loading tiles: ${error.message}` })
  }

  if (!tiles || tiles.length === 0) {
    return noTiles({
      message: `${supplier.name} has no tiles`,
      cta: {
        text: 'Add a tile',
        redirect: `/suppliers/${supplier.handle}/new`,
        show: isSupplierUser,
      },
    })
  }

  return <TileList tiles={tiles} authUserId={authUserId} />
}
