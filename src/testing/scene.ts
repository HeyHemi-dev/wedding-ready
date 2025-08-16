import { SupplierRegistrationForm, UserSignupForm } from '@/app/_types/validation-schema'
import { LOCATIONS, SERVICES } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'
import { TileModel } from '@/models/tile'
import { UserDetailModel } from '@/models/user'
import { authOperations } from '@/operations/auth-operations'
import { supplierOperations } from '@/operations/supplier-operations'
import { createAdminClient } from '@/utils/supabase/server'
import { db } from '@/db/connection'
import * as s from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { SupabaseClient } from '@supabase/supabase-js'

import { tileOperations } from '@/operations/tile-operations'
import type * as t from '@/models/types'

export const TEST_USER = {
  email: 'test.user@example.com',
  password: 'testpassword123',
  displayName: 'Test User',
  handle: 'testuser',
}

export const TEST_SUPPLIER = {
  name: 'Test Supplier',
  handle: 'testsupplier',
  websiteUrl: 'https://example.com',
  description: 'Test Supplier Description',
  locations: [LOCATIONS.WELLINGTON, LOCATIONS.AUCKLAND, LOCATIONS.CANTERBURY],
  services: [SERVICES.PHOTOGRAPHER, SERVICES.VIDEOGRAPHER],
}

export const TEST_TILE = {
  imagePath: 'https://jjoptcpwkl.ufs.sh/f/iYLB1yJLiRuVbKRyfIsPcnZN5Oa46i31HzEI09eBlrAQyX28',
  location: LOCATIONS.WELLINGTON,
}

export const TEST_ORIGIN = 'http://localhost:3000'

export const scene = {
  hasUser,
  hasSupplier,
  hasTile,
  withoutUser,
  withoutSupplier,
}

async function hasUser({
  email = TEST_USER.email,
  password = TEST_USER.password,
  displayName = TEST_USER.displayName,
  handle = TEST_USER.handle,
  supabaseClient,
}: Partial<UserSignupForm> & { supabaseClient?: SupabaseClient } = {}): Promise<t.UserDetailRaw> {
  const user = await UserDetailModel.getByHandle(handle)
  if (user) return user

  // Create a client if none provided
  const client = supabaseClient || createAdminClient()

  return await authOperations.signUp({ userSignFormData: { email, password, displayName, handle }, supabaseClient: client, origin: TEST_ORIGIN })
}

async function hasSupplier({
  name = TEST_SUPPLIER.name,
  handle = TEST_SUPPLIER.handle,
  websiteUrl = TEST_SUPPLIER.websiteUrl,
  description = TEST_SUPPLIER.description,
  locations = TEST_SUPPLIER.locations,
  services = TEST_SUPPLIER.services,
  createdByUserId,
}: Partial<SupplierRegistrationForm> & Pick<SupplierRegistrationForm, 'createdByUserId'>): Promise<t.SupplierRaw> {
  const supplier = await SupplierModel.getByHandle(handle)
  if (supplier) return supplier

  return await supplierOperations.register({ name, handle, websiteUrl, description, locations, services, createdByUserId })
}

async function hasTile({
  imagePath = TEST_TILE.imagePath,
  location = TEST_TILE.location,
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

async function withoutUser({ handle, supabaseClient }: { handle: string; supabaseClient: SupabaseClient }): Promise<void> {
  const user = await UserDetailModel.getByHandle(handle)
  if (!user) return
  await Promise.all([supabaseClient.auth.admin.deleteUser(user.id), db.delete(s.user_details).where(eq(s.user_details.id, user.id))])
}

async function withoutSupplier({ handle }: { handle: string }): Promise<void> {
  const supplier = await SupplierModel.getByHandle(handle)
  if (!supplier) return
  await db.delete(s.suppliers).where(eq(s.suppliers.id, supplier.id))
}
