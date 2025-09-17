import { eq } from 'drizzle-orm'

import { Supplier } from '@/app/_types/suppliers'
import { SupplierRegistrationForm, TileCreate, UserSignupForm } from '@/app/_types/validation-schema'
import { db } from '@/db/connection'
import { LOCATIONS, SERVICES } from '@/db/constants'
import * as s from '@/db/schema'
import { supplierModel } from '@/models/supplier'
import { tileModel } from '@/models/tile'
import type * as t from '@/models/types'
import { UserDetailModel } from '@/models/user'
import { authOperations } from '@/operations/auth-operations'
import { supplierOperations } from '@/operations/supplier-operations'
import { tileOperations } from '@/operations/tile-operations'
import { createAdminClient } from '@/utils/supabase/server'

import type { SupabaseClient } from '@supabase/supabase-js'

export const TEST_USER = {
  email: 'test.user@example.com',
  password: 'testpassword123',
  displayName: 'Test User',
  handle: 'testuser',
}
export type TestUser = typeof TEST_USER

export const TEST_SUPPLIER = {
  name: 'Test Supplier',
  handle: 'testsupplier',
  websiteUrl: 'https://example.com',
  description: 'Test Supplier Description',
  locations: [LOCATIONS.WELLINGTON, LOCATIONS.AUCKLAND, LOCATIONS.CANTERBURY],
  services: [SERVICES.PHOTOGRAPHER, SERVICES.VIDEOGRAPHER],
}
export type TestSupplier = typeof TEST_SUPPLIER

export const TEST_TILE = {
  imagePath: 'https://example.com/fake-image.jpg',
  location: LOCATIONS.WELLINGTON,
}
export type TestTile = typeof TEST_TILE

export const TEST_ORIGIN = 'http://localhost:3000'

export const scene = {
  hasUser,
  hasSupplier,
  hasTile,
  withoutUser,
  withoutSupplier,
  withoutTilesForSupplier,
  resetTestData,
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
}: Partial<SupplierRegistrationForm> & Pick<SupplierRegistrationForm, 'createdByUserId'>): Promise<Supplier> {
  const supplier = await supplierOperations.getByHandle(handle)
  if (supplier) return supplier

  return await supplierOperations.register({ name, handle, websiteUrl, description, locations, services, createdByUserId })
}

async function hasTile({
  imagePath = TEST_TILE.imagePath,
  location = TEST_TILE.location,
  createdByUserId,
  isPrivate = false,
  credits,
}: Partial<TileCreate> & Pick<TileCreate, 'createdByUserId' | 'credits'>): Promise<t.TileRaw> {
  const tiles = await db.select().from(s.tiles).where(eq(s.tiles.imagePath, imagePath))

  if (tiles.length > 0) return tiles[0]

  const newTile = await tileOperations.createForSupplier({
    imagePath,
    location,
    createdByUserId,
    isPrivate,
    credits,
  })
  const tile = await tileModel.getById(newTile.id)
  if (!tile) throw new Error('Failed to create tile')
  return tile
}

async function withoutUser({ handle = TEST_USER.handle, supabaseClient }: Partial<{ handle: string; supabaseClient: SupabaseClient }> = {}): Promise<void> {
  const user = await UserDetailModel.getByHandle(handle)
  if (!user) return

  // Create a client if none provided
  const client = supabaseClient || createAdminClient()

  await client.auth.admin.deleteUser(user.id)
}

async function withoutSupplier({ handle = TEST_SUPPLIER.handle }: Partial<{ handle: string }> = {}): Promise<void> {
  const supplier = await supplierModel.getByHandle(handle)
  if (!supplier) return
  await db.delete(s.suppliers).where(eq(s.suppliers.id, supplier.id))
}

async function withoutTilesForSupplier({ supplierHandle = TEST_SUPPLIER.handle }: Partial<{ supplierHandle: string }> = {}): Promise<void> {
  const tiles = await tileModel.getManyRawBySupplierHandle(supplierHandle)
  if (tiles.length === 0) return
  await tileModel.deleteManyByIds(tiles.map((t) => t.id))
}

async function resetTestData(): Promise<void> {
  await withoutTilesForSupplier({ supplierHandle: TEST_SUPPLIER.handle })
  await withoutSupplier({ handle: TEST_SUPPLIER.handle })
  // Don't clean up the test user. All tests assume a user exists.
}
