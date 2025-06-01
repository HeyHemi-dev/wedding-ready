import { z } from 'zod'

import { Location, Service } from '@/db/constants'
import { SetUserDetailRaw } from '@/models/types'

export const tileUploaderInputSchema = z.object({
  createdByUserId: z.string(),
  tileId: z.string(),
})

export const supplierRegistrationFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, "Name can't exceed 50 characters"),
  handle: z
    .string()
    .trim()
    .min(3, 'Handle must be at least 3 characters')
    .max(30, "Handle can't exceed 30 characters")
    .regex(/^[a-z0-9_-]+$/, 'Handle may only contain lowercase letters, numbers, hyphens, and underscores'),
  websiteUrl: z.string().trim().optional(),
  description: z.string().optional(),
  locations: z.array(z.nativeEnum(Location)).min(1, 'At least one location required'),
  services: z.array(z.nativeEnum(Service)).min(1, 'At least one service required'),
  createdByUserId: z.string().uuid(),
})
export type SupplierRegistrationForm = z.infer<typeof supplierRegistrationFormSchema>

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

export const userSignupFormSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().trim().min(1, 'Display name is required').max(30, "Display name can't exceed 30 characters"),
  handle: z
    .string()
    .trim()
    .min(3, 'Handle must be at least 3 characters')
    .max(30, "Handle can't exceed 30 characters")
    .regex(/^[a-z0-9_-]+$/, 'Handle may only contain lowercase letters, numbers, hyphens, and underscores'),
})
export type UserSignupForm = z.infer<typeof userSignupFormSchema>

const userOmitAuth = userSignupFormSchema.omit({
  email: true,
  password: true,
  handle: true,
})

// Create base schema from the database schema
export const userUpdateFormSchema = userOmitAuth.extend({
  id: z.string().uuid(),
  bio: z.string().max(160, "Bio can't exceed 160 characters").or(z.literal('')),
  avatarUrl: z.string().trim().or(z.literal('')),
  instagramUrl: z.string().trim().url('Must be a valid Instagram URL').or(z.literal('')),
  tiktokUrl: z.string().trim().url('Must be a valid TikTok URL').or(z.literal('')),
  websiteUrl: z.string().trim().url('Must be a valid website URL').or(z.literal('')),
}) satisfies z.ZodType<SetUserDetailRaw>
export type UserUpdateForm = z.infer<typeof userUpdateFormSchema>

export const userSigninFormSchema = z.object({
  email: z.string(),
  password: z.string(),
})
export type UserSigninForm = z.infer<typeof userSigninFormSchema>
