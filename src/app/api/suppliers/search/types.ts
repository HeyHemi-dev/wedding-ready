import { z } from 'zod'

import { SupplierSearchResult } from '@/app/_types/suppliers'

export const supplierSearchGetRequestSchema = z.object({
  q: z.string().optional(),
})

export type SupplierSearchGetRequest = z.infer<typeof supplierSearchGetRequestSchema>
export type SupplierSearchGetResponse = SupplierSearchResult[]

