import { QueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/app/_types/keys'
import { TileListItem } from '@/app/_types/tiles'

/**
 * Sets the save state cache for an array of tiles. Use to efficiently set the cache when fetching a large number of tiles at once.
 * @param queryClient - The query client
 * @param tiles - The array of tiles
 * @param authUserId - The id of the current authenticated user.
 */
export function setTilesSaveStateCache(queryClient: QueryClient, tiles: TileListItem[], authUserId: string) {
  tiles.forEach((tile) => {
    queryClient.setQueryData(queryKeys.tileSaveState(tile.id, authUserId), {
      authUserId,
      tileId: tile.id,
      isSaved: tile.isSaved ?? false,
    })
  })
}
