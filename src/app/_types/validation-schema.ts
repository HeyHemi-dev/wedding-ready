import { z } from 'zod'

import { LOCATIONS, SERVICES } from '@/db/constants'
import { SetUserDetailRaw } from '@/models/types'

const handleSchema = z
  .string()
  .trim()
  .min(3, 'Handle must be at least 3 characters')
  .max(30, "Handle can't exceed 30 characters")
  .regex(/^[a-z0-9_-]+$/, 'Handle may only contain lowercase letters, numbers, hyphens, and underscores')
export type Handle = z.infer<typeof handleSchema>

// USER VALIDATION

export const userSignupFormSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().trim().min(1, 'Display name is required').max(30, "Display name can't exceed 30 characters"),
  handle: handleSchema,
})
export type UserSignupForm = z.infer<typeof userSignupFormSchema>

export const userSigninFormSchema = z.object({
  email: z.string(),
  password: z.string(),
})
export type UserSigninForm = z.infer<typeof userSigninFormSchema>

export const userForgotPasswordFormSchema = userSigninFormSchema.omit({ password: true })
export type UserForgotPasswordForm = z.infer<typeof userForgotPasswordFormSchema>

export const userResetPasswordFormSchema = userSignupFormSchema.pick({ password: true }).extend({ confirmPassword: z.string() })
export type UserResetPasswordForm = z.infer<typeof userResetPasswordFormSchema>

export const userUpdateEmailFormSchema = userSignupFormSchema.pick({ email: true })
export type UserUpdateEmailForm = z.infer<typeof userUpdateEmailFormSchema>

const userOmitAuth = userSignupFormSchema.omit({
  email: true,
  password: true,
  handle: true,
})

export const userUpdateFormSchema = userOmitAuth.extend({
  id: z.string().uuid(),
  bio: z.string().max(160, "Bio can't exceed 160 characters").or(z.literal('')),
  avatarUrl: z.string().trim().or(z.literal('')),
  instagramUrl: z.string().trim().url('Must be a valid Instagram URL').or(z.literal('')),
  tiktokUrl: z.string().trim().url('Must be a valid TikTok URL').or(z.literal('')),
  websiteUrl: z.string().trim().url('Must be a valid website URL').or(z.literal('')),
}) satisfies z.ZodType<SetUserDetailRaw>
export type UserUpdateForm = z.infer<typeof userUpdateFormSchema>

// SUPPLIER VALIDATION

export const supplierRegistrationFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, "Name can't exceed 50 characters"),
  handle: handleSchema,
  websiteUrl: z.string().trim().optional(),
  description: z.string().optional(),
  locations: z.array(z.nativeEnum(LOCATIONS)).min(1, 'At least one location required'),
  services: z.array(z.nativeEnum(SERVICES)).min(1, 'At least one service required'),
  createdByUserId: z.string().uuid(),
})
export type SupplierRegistrationForm = z.infer<typeof supplierRegistrationFormSchema>

// TILE VALIDATION

const creditSchema = z.object({
  supplier: z.object({
    id: z.string(),
    name: z.string(),
    handle: z.string(),
  }),
  service: z.nativeEnum(SERVICES).optional(),
  serviceDescription: z.string().optional(),
})

export const tileCreditFormSchema = creditSchema
export type TileCreditForm = z.infer<typeof tileCreditFormSchema>

export const tileUploaderInputSchema = z.object({
  createdByUserId: z.string(),
  tileId: z.string(),
})

export const tileUploadPreviewFormSchema = z.object({
  title: z.string().trim().max(100, "Title can't exceed 100 characters").optional(),
  description: z.string().trim().optional(),
  location: z.nativeEnum(LOCATIONS).optional(),
  createdByUserId: z.string(),
  isPrivate: z.boolean(),
  credits: z.array(creditSchema),
})
export type TileUploadPreviewForm = z.infer<typeof tileUploadPreviewFormSchema>
export type TileCreate = TileUploadPreviewForm & { imagePath: string }
