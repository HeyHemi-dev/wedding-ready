import { z } from 'zod'
import { TileListItem } from '@/app/_types/tiles'

const feedGetRequestParams = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
})

export type FeedGetRequestParams = z.infer<typeof feedGetRequestParams>
export type FeedGetResponseBody = {
  tiles: TileListItem[]
  nextCursor: string | null
  hasNextPage: boolean
}
