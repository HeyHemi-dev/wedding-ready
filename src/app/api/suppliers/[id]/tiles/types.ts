import { z } from 'zod'

import { TileListItem } from '@/app/_types/tiles'

export const supplierTilesGetRequestSchema = z.object({
  authUserId: z.string().optional(),
})

export type SupplierTilesGetRequest = z.infer<typeof supplierTilesGetRequestSchema>
export type SupplierTilesGetResponse = TileListItem[]

