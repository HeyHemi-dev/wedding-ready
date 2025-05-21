import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tile } from '@/models/types'

import { SaveTileButton } from './save-button'

export function TileList({ tiles, authUserId }: { tiles: Tile[]; authUserId?: string }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-md md:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <TileListItem key={tile.id} tile={tile} authUserId={authUserId} />
        ))}
      </div>
    </>
  )
}

export function TileListItem({ tile, authUserId }: { tile: Tile; authUserId?: string }) {
  return (
    <div className="grid grid-rows-[auto_1fr] gap-partner">
      <div className="relative">
        <Link href={`/t/${tile.id}`} className="relative block aspect-[2/3] overflow-hidden rounded-area bg-muted">
          <Image src={tile.imagePath} alt={tile.title ?? ''} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" className="object-contain" />
        </Link>
        {authUserId && (
          <SaveTileButton tileId={tile.id} authUserId={authUserId} className="pointer-events-none absolute inset-0 flex items-start justify-end p-contour" />
        )}
      </div>

      <p className="ui-small-s1 px-4">{tile.title}</p>
    </div>
  )
}

export function TileListSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-md md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-rows-[auto_1fr] gap-xs">
          <Skeleton className="aspect-[2/3] rounded-lg" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-2 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface noTilesProps {
  message: string
  cta?: {
    text: string
    redirect: string
    show?: boolean
  }
}

export function noTiles({ message, cta }: noTilesProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">{message}</p>
      {cta && cta.show && (
        <Button variant={'default'} asChild>
          <Link href={cta.redirect} passHref>
            {cta.text}
          </Link>
        </Button>
      )}
    </div>
  )
}
