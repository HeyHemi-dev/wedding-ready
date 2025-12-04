import { z } from 'zod'

import { LOCATIONS, SERVICES } from '@/db/constants'
import * as t from '@/models/types'
import { optionalField } from '@/utils/empty-strings'

const emailSchema = z.string().trim().email('Invalid email')

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export const handleSchema = z
  .string()
  .trim()
  .min(3, 'Handle must be at least 3 characters')
  .max(30, "Handle can't exceed 30 characters")
  .regex(/^[a-z0-9_]+$/, 'Handle may only contain lowercase letters, numbers, and underscores')
export type Handle = z.infer<typeof handleSchema>

// USER VALIDATION

export const userSignupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(1, 'Display name is required').max(30, "Display name can't exceed 30 characters"),
  handle: handleSchema,
})
export type UserSignupForm = z.infer<typeof userSignupFormSchema>

export const userSigninFormSchema = z.object({
  email: z.string(),
  password: z.string(),
})
export type UserSigninForm = z.infer<typeof userSigninFormSchema>

export const userForgotPasswordFormSchema = z.object({
  email: emailSchema,
})
export type UserForgotPasswordForm = z.infer<typeof userForgotPasswordFormSchema>

export const userResetPasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

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
  bio: optionalField(z.string().min(1).max(160, "Bio can't exceed 160 characters")),
  avatarUrl: optionalField(z.string().trim().min(1)),
  instagramUrl: optionalField(
    z
      .string()
      .trim()
      .url('Must be a valid Instagram URL')
      .refine((url) => url.startsWith('https://www.instagram.com/'), {
        message: 'Must start with https://www.instagram.com/',
      })
  ),
  tiktokUrl: optionalField(
    z
      .string()
      .trim()
      .url('Must be a valid TikTok URL')
      .refine((url) => url.startsWith('https://www.tiktok.com/'), {
        message: 'Must start with https://www.tiktok.com/',
      })
  ),
  websiteUrl: optionalField(z.string().trim().url('Must be a valid website URL')),
}) satisfies z.ZodType<t.SetUserProfileRaw>
export type UserUpdateForm = z.infer<typeof userUpdateFormSchema>

// SUPPLIER VALIDATION

export const supplierRegistrationFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, "Name can't exceed 50 characters"),
  handle: handleSchema,
  websiteUrl: optionalField(z.string().trim().url('Must be a valid website URL')),
  description: optionalField(z.string().trim().min(1)),
  locations: z.array(z.nativeEnum(LOCATIONS)).min(1, 'At least one location required'),
  services: z.array(z.nativeEnum(SERVICES)).min(1, 'At least one service required'),
})
export type SupplierRegistrationForm = z.infer<typeof supplierRegistrationFormSchema>

export const supplierUpdateFormSchema = supplierRegistrationFormSchema.pick({
  name: true,
  websiteUrl: true,
  description: true,
})
export type SupplierUpdateForm = z.infer<typeof supplierUpdateFormSchema>

// TILE VALIDATION

const creditSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  service: z.nativeEnum(SERVICES, {
    errorMap: () => ({ message: 'Service is required' }),
  }),
  serviceDescription: optionalField(z.string().trim().min(1).max(160, "Service description can't exceed 160 characters")),
})

export const tileCreditFormSchema = creditSchema
export type TileCreditForm = z.infer<typeof tileCreditFormSchema>

export const tileUploaderInputSchema = z.object({
  createdByUserId: z.string(),
  tileId: z.string(),
})

export const tileUploadFormSchema = z.object({
  title: optionalField(z.string().trim().min(1).max(100, "Title can't exceed 100 characters")),
  description: optionalField(z.string().trim().min(1).max(240, "Description can't exceed 240 characters")),
  location: z.nativeEnum(LOCATIONS, {
    errorMap: () => ({ message: 'Location is required' }),
  }),
  credits: z.array(creditSchema),
})
export type TileUploadForm = z.infer<typeof tileUploadFormSchema>

export const tileUploadSchema = z.object({
  formData: tileUploadFormSchema,
  authUserId: z.string(),
  supplierId: z.string(),
})
export type TileUpload = z.infer<typeof tileUploadSchema>

export const tileCreateSchema = tileUploadFormSchema.extend({
  imagePath: z.string().min(1),
  createdByUserId: z.string(),
})
export type TileCreate = z.infer<typeof tileCreateSchema>

// FEED VALIDATION

export const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
})
export type FeedQuery = z.infer<typeof feedQuerySchema>
