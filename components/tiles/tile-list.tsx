import { Tile } from '@/models/types'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import Image from 'next/image'

export function TileList({ tiles }: { tiles: Tile[] }) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md">
        {tiles.map((tile) => (
          <TileListItem key={tile.id} tile={tile} />
        ))}
      </div>
    </>
  )
}

export function TileListItem({ tile }: { tile: Tile }) {
  return (
    <div className="gap-xs grid grid-rows-[auto_1fr]">
      <Link href={`/t/${tile.id}`} className="aspect-[2/3] bg-muted rounded-lg overflow-hidden relative">
        <Image src={tile.imagePath} alt={tile.title} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" className="object-contain" />
      </Link>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">{tile.title}</p>
        {tile.description && <p className="text-xs text-muted-foreground">{tile.description}</p>}
      </div>
    </div>
  )
}

export function TileListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md">
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
