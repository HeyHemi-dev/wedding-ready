import { SupplierRegistrationForm, TileUploadPreviewForm, UserSignupForm } from '@/app/_types/validation-schema'
import { LOCATIONS, SERVICES, type Location, type Service } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'
import { TileModel } from '@/models/tile'
import { UserDetailModel } from '@/models/user'
import { authOperations } from '@/operations/auth-operations'
import { supplierOperations } from '@/operations/supplier-operations'
import { createAdminClient } from '@/utils/supabase/server'
import { db } from '@/db/connection'
import * as s from '@/db/schema'
import { eq } from 'drizzle-orm'

import { tileOperations } from '@/operations/tile-operations'
import type * as t from '@/models/types'

export const DEFAULT_USER = {
  email: 'hello.hemi.phillips@gmail.com',
  password: 'password',
  displayName: 'Hemi Phillips',
  handle: 'heyhemi',
}

export const DEFAULT_SUPPLIER = {
  name: 'Patina Photo',
  handle: 'patina_photo',
  websiteUrl: 'https://patina.photo',
  description: 'We are wedding photographers + videographers who travel NZ, capturing all the feels from the party of a lifetime.',
  locations: [LOCATIONS.WELLINGTON, LOCATIONS.AUCKLAND, LOCATIONS.CANTERBURY],
  services: [SERVICES.PHOTOGRAPHER, SERVICES.VIDEOGRAPHER],
}

export const DEFAULT_TILE = {
  imagePath: 'https://jjoptcpwkl.ufs.sh/f/iYLB1yJLiRuVbKRyfIsPcnZN5Oa46i31HzEI09eBlrAQyX28',
  location: LOCATIONS.WELLINGTON,
}

export const scene = {
  hasUser,
  hasSupplier,
  hasTile,
}

async function hasUser({
  email = DEFAULT_USER.email,
  password = DEFAULT_USER.password,
  displayName = DEFAULT_USER.displayName,
  handle = DEFAULT_USER.handle,
}: Partial<UserSignupForm> = {}): Promise<t.UserDetailRaw> {
  const user = await UserDetailModel.getByHandle(handle)
  if (user) return user

  const supabaseAdmin = createAdminClient()
  const ORIGIN = 'http://localhost:3000'

  return await authOperations.signUp({ userSignFormData: { email, password, displayName, handle }, supabaseClient: supabaseAdmin, origin: ORIGIN })
}

async function hasSupplier({
  name = DEFAULT_SUPPLIER.name,
  handle = DEFAULT_SUPPLIER.handle,
  websiteUrl = DEFAULT_SUPPLIER.websiteUrl,
  description = DEFAULT_SUPPLIER.description,
  locations = DEFAULT_SUPPLIER.locations,
  services = DEFAULT_SUPPLIER.services,
  createdByUserId,
}: Partial<SupplierRegistrationForm> & Pick<SupplierRegistrationForm, 'createdByUserId'>): Promise<t.SupplierRaw> {
  const supplier = await SupplierModel.getByHandle(handle)
  if (supplier) return supplier

  return await supplierOperations.register({ name, handle, websiteUrl, description, locations, services, createdByUserId })
}

async function hasTile({
  imagePath = DEFAULT_TILE.imagePath,
  location = DEFAULT_TILE.location,
  createdByUserId,
  supplierIds,
}: t.InsertTileRaw & { supplierIds: string[] }): Promise<t.TileRaw> {
  const tiles = await db
    .select()
    .from(s.tiles)
    .where(eq(s.tiles.imagePath, imagePath ?? ''))
  if (tiles.length > 0) return tiles[0]

  const newTile = await tileOperations.createForSupplier({ InsertTileRawData: { imagePath, location, createdByUserId }, supplierIds })
  const tile = await TileModel.getById(newTile.id)
  if (!tile) throw new Error('Failed to create tile')
  return tile
}
