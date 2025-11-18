'use client'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { queryKeys } from '@/app/_types/keys'
import { TileCreditForm } from '@/app/_types/validation-schema'
import { TileCreditGetResponseBody, TileCreditPostRequestBody, TileCreditPostResponseBody } from '@/app/api/tiles/[tileId]/credits/route'
import { tryCatchFetch } from '@/utils/try-catch'

import { TileCredit } from '../_types/tiles'

export function useTileCredit(tileId: string) {
  const queryClient = useQueryClient()

  const creditsQuery = useSuspenseQuery({
    queryKey: queryKeys.tileCredits(tileId),
    queryFn: () => fetchCredits(tileId),
    initialData: () => queryClient.getQueryData(queryKeys.tileCredits(tileId)),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const add = useMutation({
    mutationFn: (tileCreditForm: TileCreditForm) => postCredit(tileId, tileCreditForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tileCredits(tileId) })
    },
  })

  return { ...creditsQuery, addCredit: add.mutateAsync }
}

async function fetchCredits(tileId: string): Promise<TileCredit[]> {
  const { data, error } = await tryCatchFetch<TileCreditGetResponseBody>(`/api/tiles/${tileId}/credits`)
  if (error) {
    throw error
  }
  return data
}

async function postCredit(tileId: string, tileCreditForm: TileCreditForm): Promise<TileCreditPostResponseBody> {
  const tileCreditRequestBody: TileCreditPostRequestBody = tileCreditForm

  const { data, error } = await tryCatchFetch<TileCreditPostResponseBody>(`/api/tiles/${tileId}/credits`, {
    method: 'POST',
    body: JSON.stringify(tileCreditRequestBody),
  })
  if (error) {
    throw error
  }
  return data
}
