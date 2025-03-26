import { z } from 'zod'
import { Location } from '@/db/constants'
import { SetUserDetailRaw } from '@/models/types'

export const tileUploaderInputSchema = z.object({
  createdByUserId: z.string(),
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

// Create base schema from the database schema
export const userUpdateFormSchema = z.object({
  handle: z
    .string()
    .trim()
    .min(3, 'Handle is required and must be at least 3 characters')
    .max(30, 'Handle can’t exceed 30 characters')
    .regex(/^[a-z0-9_-]+$/, 'Handle may only contain lowercase letters, numbers, hyphens, and underscores'),
  displayName: z.string().trim().min(1, 'Display name is required').max(255, 'Display name can’t exceed 255 characters'),
  bio: z.string().max(160, 'Bio can’t exceed 160 characters').nullable(),
  avatarUrl: z.string().url('Avatar must be a valid URL').or(z.literal('')).nullable(),
  instagramUrl: z.string().url('Instagram URL must be valid').or(z.literal('')).nullable(),
  tiktokUrl: z.string().url('TikTok URL must be valid').or(z.literal('')).nullable(),
  websiteUrl: z.string().url('Website URL must be valid').or(z.literal('')).nullable(),
}) satisfies z.ZodType<SetUserDetailRaw>
