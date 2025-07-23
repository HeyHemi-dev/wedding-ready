'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { tileKeys } from '@/app/_types/queryKeys'
import {
  TileCreditGetResponseBody,
  TileCreditPostRequestBody,
  TileCreditPostResponseBody,
} from '@/app/api/tiles/[tileId]/credits/route'
import { DEFAULT_STALE_TIME } from '@/utils/constants'
import { tryCatchFetch } from '@/utils/try-catch'

export function useTileCredit(tileId: string) {
  const queryClient = useQueryClient()

  const creditsQuery = useQuery({
    queryKey: tileKeys.credits(tileId),
    queryFn: () => fetchCredits(tileId),
    staleTime: DEFAULT_STALE_TIME,
  })

  const mutation = useMutation({
    mutationFn: (data: TileCreditPostRequestBody) => postCredit(tileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tileKeys.credits(tileId) })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return { ...creditsQuery, addCredit: mutation.mutateAsync }
}

async function fetchCredits(tileId: string): Promise<TileCreditGetResponseBody> {
  const { data, error } = await tryCatchFetch<TileCreditGetResponseBody>(`/api/tiles/${tileId}/credits`)
  if (error) {
    throw error
  }
  return data
}

async function postCredit(
  tileId: string,
  data: TileCreditPostRequestBody
): Promise<TileCreditPostResponseBody> {
  const { data: result, error } = await tryCatchFetch<TileCreditPostResponseBody>(`/api/tiles/${tileId}/credits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (error) {
    throw error
  }
  return result
}
