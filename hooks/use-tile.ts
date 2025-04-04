import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { SaveTileRequestBody, SaveTileResponseBody } from '@/app/api/users/[id]/tiles/[tileId]/route'
import { tryCatchFetch } from '@/utils/try-catch'
import { toast } from 'sonner'
import { tileKeys } from './queryKeys'

export function useTileSaveState(tileId: string, userId: string) {
  const queryClient = useQueryClient()

  const Query = useQuery({
    queryKey: tileKeys.saveState(tileId, userId),
    queryFn: () => fetchSaveTile(userId, tileId),
    initialData: queryClient.getQueryData(tileKeys.saveState(tileId, userId)),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const Mutate = useMutation({
    mutationFn: ({ userId, isSaved }: { userId: string; isSaved: boolean }) => postSaveTile(userId, tileId, isSaved),
    // handle race conditions while optimistically updating the tile's saved state, and return the previous value in case we need to roll back
    onMutate: async ({ userId, isSaved }) => {
      // Cancel any in flight
      await queryClient.cancelQueries({ queryKey: tileKeys.saveState(tileId, userId) })

      const previousSaveState = queryClient.getQueryData(tileKeys.saveState(tileId, userId))

      // Optimistic update
      queryClient.setQueryData(tileKeys.saveState(tileId, userId), isSaved)

      return { previousSaveState }
    },
    // If the mutation fails, roll back
    onError: (err, variables, context) => {
      if (context?.previousSaveState) {
        queryClient.setQueryData(tileKeys.saveState(tileId, variables.userId), context.previousSaveState)
      }
    },
    // Always refetch after error or success to ensure we have the latest data
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: tileKeys.saveState(tileId, variables.userId) })
    },
  })

  return { ...Query, ...Mutate }
}

async function fetchSaveTile(userId: string, tileId: string): Promise<SaveTileResponseBody> {
  // const { data, error } = await tryCatchFetch<SaveTileResponseBody>(`/api/users/${userId}/tiles/${tileId}`)

  // if (error) {
  //   toast('Failed to get tile')
  //   throw error
  // }

  // return data
  return { isSaved: false, userId, tileId }
}

async function postSaveTile(userId: string, tileId: string, isSaved: boolean): Promise<SaveTileResponseBody> {
  const saveTileRequestBody: SaveTileRequestBody = {
    isSaved,
  }

  const { data, error } = await tryCatchFetch<SaveTileResponseBody>(`/api/users/${userId}/tiles/${tileId}`, {
    method: 'POST',
    body: JSON.stringify(saveTileRequestBody),
  })

  if (error) {
    toast('Failed to save tile')
    throw error
  }

  return data
}
