import { useMutation, useQueryClient, useQuery, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { SaveTilePostRequestBody, SaveTilePostResponseBody } from '@/app/api/users/[id]/tiles/[tileId]/route'
import * as t from '@/models/types'
import { tryCatchFetch } from '@/utils/try-catch'

import { tileKeys } from '@/app/_types/queryKeys'

export function useTileSaveState(tileId: string, authUserId: string) {
  const queryClient = useQueryClient()

  const Query = useQuery({
    queryKey: tileKeys.saveState(tileId, authUserId),
    queryFn: () => fetchSaveTile(authUserId, tileId),
    initialData: () => queryClient.getQueryData(tileKeys.saveState(tileId, authUserId)),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const Mutate = useMutation({
    mutationFn: ({ authUserId, isSaved }: { authUserId: string; isSaved: boolean }) => postSaveTile(authUserId, tileId, isSaved),
    // handle race conditions while optimistically updating the tile's saved state, and return the previous value in case we need to roll back
    onMutate: async ({ authUserId, isSaved }) => {
      // Cancel any in flight
      await queryClient.cancelQueries({ queryKey: tileKeys.saveState(tileId, authUserId) })

      const previousSaveState = queryClient.getQueryData(tileKeys.saveState(tileId, authUserId))

      // Optimistic update
      queryClient.setQueryData(tileKeys.saveState(tileId, authUserId), {
        authUserId,
        tileId,
        isSaved,
      })

      return { previousSaveState }
    },
    // If the mutation fails, roll back
    onError: (err, variables, context) => {
      if (context?.previousSaveState) {
        queryClient.setQueryData(tileKeys.saveState(tileId, variables.authUserId), context.previousSaveState)
      }
    },
    // Always refetch after error or success to ensure we have the latest data
    onSettled: (data, error, variables) => {
      // Invalidate the save state for this specific tile/user combination
      queryClient.invalidateQueries({ queryKey: tileKeys.saveState(tileId, variables.authUserId) })

      // Invalidate the authuser's saved tiles
      queryClient.invalidateQueries({ queryKey: tileKeys.userTiles(variables.authUserId) })
    },
  })

  return { ...Query, ...Mutate }
}

async function fetchSaveTile(authUserId: string, tileId: string): Promise<SaveTilePostResponseBody> {
  const { data, error } = await tryCatchFetch<SaveTilePostResponseBody>(`/api/users/${authUserId}/tiles/${tileId}`)

  if (error) {
    toast('Failed to get tile')
    throw error
  }

  return data
}

async function postSaveTile(authUserId: string, tileId: string, isSaved: boolean): Promise<SaveTilePostResponseBody> {
  const saveTileRequestBody: SaveTilePostRequestBody = {
    isSaved,
  }

  const { data, error } = await tryCatchFetch<SaveTilePostResponseBody>(`/api/users/${authUserId}/tiles/${tileId}`, {
    method: 'POST',
    body: JSON.stringify(saveTileRequestBody),
  })

  if (error) {
    toast('Failed to save tile')
    throw error
  }

  return data
}

/**
 * Sets the save state cache for an array of tiles. Use to efficiently set the cache when fetching a large number of tiles at once.
 * @param queryClient - The query client
 * @param tiles - The array of tiles
 * @param authUserId - The id of the current authenticated user.
 */
export function setTilesSaveStateCache(queryClient: QueryClient, tiles: t.Tile[], authUserId: string) {
  tiles.forEach((tile) => {
    queryClient.setQueryData(tileKeys.saveState(tile.id, authUserId), {
      authUserId,
      tileId: tile.id,
      isSaved: tile.isSaved ?? false,
    })
  })
}
