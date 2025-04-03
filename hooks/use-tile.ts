import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SaveTileRequestBody, SaveTileResponseBody } from '@/app/api/users/[id]/tiles/[tileId]/route'
import { tryCatchFetch } from '@/utils/try-catch'
import { toast } from 'sonner'

export function useTile(tileId: string) {
  const queryClient = useQueryClient()

  const saveUnsave = useMutation({
    mutationFn: ({ userId, isSaved }: { userId: string; isSaved: boolean }) => fetchSaveTile(userId, tileId, isSaved),
    // handle race conditions while optimistically updating the tile's saved state, and return the previous value in case we need to roll back
    onMutate: async ({ userId, isSaved }) => {
      // Cancel any in flight
      await queryClient.cancelQueries({ queryKey: ['saveTile', tileId, userId] })

      const previousSaveState = queryClient.getQueryData(['saveTile', tileId, userId])

      // Optimistic update
      queryClient.setQueryData(['saveTile', tileId, userId], (old: any) => ({
        ...old,
        isSaved,
      }))

      return { previousSaveState }
    },
    // If the mutation fails, roll back
    onError: (err, variables, context) => {
      if (context?.previousSaveState) {
        queryClient.setQueryData(['saveTile', tileId, variables.userId], context.previousSaveState)
      }
    },
    // Always refetch after error or success to ensure we have the latest data
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saveTile', tileId, variables.userId] })
    },
  })

  return { saveUnsave }
}

async function fetchSaveTile(userId: string, tileId: string, isSaved: boolean): Promise<SaveTileResponseBody> {
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
