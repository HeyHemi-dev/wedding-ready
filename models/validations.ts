import { z } from 'zod'
import { Location } from '@/models/constants'
export const tileUploaderInputSchema = z.object({
  tileId: z.string(),
})

const supplierSchema = z.object({
  id: z.string(),
  description: z.string().nullable(),
  name: z.string(),
  createdByUserId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  handle: z.string(),
  handleUpdatedAt: z.date(),
  websiteUrl: z.string().nullable(),
})

export const tileUpdateFormSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  location: z.nativeEnum(Location).nullable(),
  isPrivate: z.boolean(),
  suppliers: z.array(supplierSchema),
})
