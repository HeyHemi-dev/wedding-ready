import { z } from 'zod'

export const tileUploaderInputSchema = z.array(
  z.object({
    tileId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    isPrivate: z.boolean().optional(),
    suppliers: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        handle: z.string(),
        handleUpdatedAt: z.string(),
        description: z.string().optional(),
        websiteUrl: z.string().optional(),
        createdByUserId: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
    ),
  })
)
