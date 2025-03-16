import { Tile } from '@/models/types'
import { Skeleton } from '@/components/ui/skeleton'

export function TileList({ tiles }: { tiles: Tile[] }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tiles.map((tile) => (
          <TileListItem key={tile.id} tile={tile} />
        ))}
      </div>
    </>
  )
}

export function TileListItem({ tile }: { tile: Tile }) {
  return (
    <div className="grid grid-rows-[auto_1fr] gap-2">
      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
        <img src={tile.imagePath} alt={tile.title} className="h-full w-full object-contain" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-lg font-semibold">{tile.title}</p>
        {tile.description && <p className="text-sm text-muted-foreground">{tile.description}</p>}
      </div>
    </div>
  )
}

export function TileListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="grid grid-rows-[auto_1fr] gap-2">
          <Skeleton key={index} className="aspect-square rounded-lg" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
