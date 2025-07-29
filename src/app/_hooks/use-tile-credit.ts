'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { tileKeys } from '@/app/_types/queryKeys'
import { TileCreditGetResponseBody, TileCreditPostRequestBody, TileCreditPostResponseBody } from '@/app/api/tiles/[tileId]/credits/route'
import { DEFAULT_STALE_TIME } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'
import { TileCredit } from '../_types/tiles'
import { TileCreditForm } from '../_types/validation-schema'

export function useTileCredit(tileId: string) {
  const queryClient = useQueryClient()

  const creditsQuery = useQuery({
    queryKey: tileKeys.credits(tileId),
    queryFn: () => fetchCredits(tileId),
    initialData: () => queryClient.getQueryData(tileKeys.credits(tileId)),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const add = useMutation({
    mutationFn: (tileCreditForm: TileCreditForm) => postCredit(tileId, tileCreditForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tileKeys.credits(tileId) })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return { ...creditsQuery, addCredit: add.mutateAsync }
}

async function fetchCredits(tileId: string): Promise<TileCreditGetResponseBody> {
  const { data, error } = await tryCatchFetch<TileCreditGetResponseBody>(`/api/tiles/${tileId}/credits`)
  if (error) {
    throw error
  }
  return data
}

async function postCredit(tileId: string, tileCreditForm: TileCreditForm): Promise<TileCreditPostResponseBody> {
  const tileCreditRequestBody: TileCreditPostRequestBody = { ...tileCreditForm }

  const { data, error } = await tryCatchFetch<TileCreditPostResponseBody>(`/api/tiles/${tileId}/credits`, {
    method: 'POST',
    body: JSON.stringify(tileCreditRequestBody),
  })
  if (error) {
    throw error
  }
  return data
}
