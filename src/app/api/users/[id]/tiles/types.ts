import { z } from 'zod'

import { TileListItem } from '@/app/_types/tiles'

export const userTilesGetRequestSchema = z.object({
  authUserId: z.string().optional(),
})

export type UserTilesGetRequest = z.infer<typeof userTilesGetRequestSchema>
export type UserTilesGetResponse = TileListItem[]
