import { z } from 'zod'

import { FeedQueryResult } from '@/app/_types/tiles'

export const feedGetRequestSchema = z.object({
  pageSize: z.coerce.number().int().positive(),
})

export type FeedGetRequest = z.infer<typeof feedGetRequestSchema>
export type FeedGetResponse = FeedQueryResult

