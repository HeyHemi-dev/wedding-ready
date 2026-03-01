import { eq, inArray, or, sql } from 'drizzle-orm'
import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { Supplier } from '@/app/_types/suppliers'
import { OnboardingForm, SupplierRegistrationForm, SupplierUpdateForm, TileCreate, TileCreditForm, UserSignupForm } from '@/app/_types/validation-schema'
import { db } from '@/db/connection'
import { LOCATIONS, SERVICES } from '@/db/constants'
import * as s from '@/db/schema'
import { supplierModel } from '@/models/supplier'
import { tileModel } from '@/models/tile'
import type * as t from '@/models/types'
import { userProfileModel } from '@/models/user'
import { authOperations } from '@/operations/auth-operations'
import { supplierOperations } from '@/operations/supplier-operations'
import { tileOperations } from '@/operations/tile-operations'
import { BASE_URL } from '@/utils/constants'
import { createAdminClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

import type { SupabaseClient } from '@supabase/supabase-js'

// Shared Supabase admin client for tests to avoid multiple instances
export const testClient = createAdminClient()

export const TEST_ID = '123e4567-e89b-4123-a456-426614174000'
export const TEST_ID_0 = '00000000-0000-4000-8000-000000000000'
export const TEST_ID_F = 'ffffffff-ffff-4fff-bfff-ffffffffffff'

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
  imageRatio: 0.667,
  title: '',
  description: '',
  location: LOCATIONS.WELLINGTON,
}
export type TestTile = typeof TEST_TILE

export const TEST_ORIGIN = BASE_URL

const TEST_MARKER = '__t_'

type TestContext = {
  ns: string
  createdUserIds: Set<string>
  createdSupplierIds: Set<string>
  createdTileIds: Set<string>
}

type CleanupIssue = {
  operation: string
  message: string
}

const testContextStore = new AsyncLocalStorage<TestContext>()
let activeTestContext: TestContext | null = null

type TestUserProfile = t.UserProfileRaw & { email: string }

export const scene = {
  setup,
  cleanup,
  namespace,
  cleanupStaleData,
  hasUser,
  hasSupplier,
  hasUserAndSupplier,
  hasTile,
  hasUserSupplierAndTile,
  withoutUser,
  withoutSupplier,
  withoutTilesForSupplier,
  resetTestData,
}

/**
 * Initializes per-test scene context.
 *
 * Side effects:
 * - creates a new namespaced TestContext (`ns`) and empty created-id sets
 * - mutates `activeTestContext`
 * - writes context into AsyncLocalStorage via `testContextStore.enterWith(ctx)`
 *
 * Call order:
 * - call before creating test resources (typically in `beforeEach`)
 *
 * Concurrency:
 * - context is per async call-chain; each concurrent test must call `setup`
 *   in its own lifecycle to avoid sharing fallback `activeTestContext`.
 */
function setup(): void {
  const ctx: TestContext = {
    ns: randomUUID().slice(0, 8),
    createdUserIds: new Set(),
    createdSupplierIds: new Set(),
    createdTileIds: new Set(),
  }
  activeTestContext = ctx
  testContextStore.enterWith(ctx)
}

function namespace(): string {
  const ctx = getTestContext()
  if (!ctx) {
    throw new Error('No active test scene namespace. Call scene.setup() before using namespaced test data.')
  }

  return namespacePrefix(ctx.ns)
}

/**
 * Finalizes per-test scene context and performs destructive cleanup.
 *
 * Side effects:
 * - deletes resources tracked in context:
 *   - tiles via `tileModel.deleteManyByIds(createdTileIds)`
 *   - suppliers via `db.delete(...inArray(...createdSupplierIds))`
 *   - auth users via `testClient.auth.admin.deleteUser` (through helper)
 * - aggregates cleanup issues and may log them
 * - clears created-id sets and resets `activeTestContext` to `null`
 *
 * Call order:
 * - call after each test (typically in `afterEach`) to prevent cross-test bleed.
 */
async function cleanup(): Promise<void> {
  const ctx = getTestContext()
  if (!ctx) return

  const cleanupIssues: CleanupIssue[] = []

  if (ctx.createdTileIds.size > 0) {
    const { error } = await tryCatch(tileModel.deleteManyByIds([...ctx.createdTileIds]))
    if (error) {
      cleanupIssues.push(toCleanupIssue('delete_created_tiles', error))
    }
  }

  if (ctx.createdSupplierIds.size > 0) {
    const { error } = await tryCatch(db.delete(s.suppliers).where(inArray(s.suppliers.id, [...ctx.createdSupplierIds])))
    if (error) {
      cleanupIssues.push(toCleanupIssue('delete_created_suppliers', error))
    }
  }

  if (ctx.createdUserIds.size > 0) {
    const { error: ownedDataCleanupError } = await tryCatch(cleanupOwnedDataByUserIds([...ctx.createdUserIds]))
    if (ownedDataCleanupError) {
      cleanupIssues.push(toCleanupIssue('cleanup_owned_data_by_user', ownedDataCleanupError))
    }

    for (const userId of ctx.createdUserIds) {
      await deleteAuthUserById(userId, { cleanupIssues, operation: 'delete_created_user' })
    }
  }

  ctx.createdTileIds.clear()
  ctx.createdSupplierIds.clear()
  ctx.createdUserIds.clear()
  activeTestContext = null
  if (cleanupIssues.length > 0) {
    logCleanupIssues('Test cleanup encountered issues', cleanupIssues)
  }
}

/**
 * Removes stale namespaced test data not tied to current in-memory context.
 *
 * Side effects:
 * - invokes `cleanupByPattern()` for broad stale namespaced cleanup.
 *
 * Usage:
 * - intended for global setup/teardown safety net, not primary per-test cleanup.
 */
async function cleanupStaleData(): Promise<void> {
  await cleanupByPattern()
}

async function hasUser({
  email = TEST_USER.email,
  password = TEST_USER.password,
  displayName = TEST_USER.displayName,
  handle = TEST_USER.handle,
  avatarUrl = '',
  supabaseClient = testClient,
}: Partial<UserSignupForm> & Partial<OnboardingForm> & { supabaseClient?: SupabaseClient } = {}): Promise<TestUserProfile> {
  const ctx = getTestContext()
  const scopedHandle = scopedValue(handle, ctx)
  const [localPart, domainPart] = email.split('@')
  const scopedEmail =
    !ctx || !domainPart
      ? scopedValue(email, ctx)
      : localPart.startsWith(namespacePrefix(ctx.ns))
        ? email
        : `${namespacePrefix(ctx.ns)}${localPart}@${domainPart}`

  const user = await userProfileModel.getRawByHandle(scopedHandle)
  if (user) return { ...user, email: scopedEmail }

  const { id } = await authOperations.signUp({ userSignFormData: { email: scopedEmail, password }, supabaseClient, origin: TEST_ORIGIN })
  const profile = await authOperations.completeOnboarding(id, { handle: scopedHandle, displayName, avatarUrl })

  ctx?.createdUserIds.add(profile.id)
  return { ...profile, email: scopedEmail }
}

async function hasSupplier({
  name = TEST_SUPPLIER.name,
  handle = TEST_SUPPLIER.handle,
  websiteUrl = TEST_SUPPLIER.websiteUrl,
  description = TEST_SUPPLIER.description,
  locations = TEST_SUPPLIER.locations,
  services = TEST_SUPPLIER.services,
  createdByUserId,
}: Partial<SupplierRegistrationForm> & { createdByUserId: string }): Promise<Supplier> {
  const ctx = getTestContext()
  const scopedHandle = scopedValue(handle, ctx)

  const supplier = await supplierOperations.getByHandle(scopedHandle)
  if (supplier) return supplier

  const createdSupplier = await supplierOperations.register({ name, handle: scopedHandle, websiteUrl, description, locations, services }, createdByUserId)
  ctx?.createdSupplierIds.add(createdSupplier.id)
  return createdSupplier
}

async function hasUserAndSupplier(): Promise<{ user: TestUserProfile; supplier: Supplier }> {
  const user = await hasUser()
  const supplier = await hasSupplier({ createdByUserId: user.id })
  return { user, supplier }
}

async function hasTile({
  imagePath = TEST_TILE.imagePath,
  imageRatio = TEST_TILE.imageRatio,
  title = TEST_TILE.title,
  description = TEST_TILE.description,
  location = TEST_TILE.location,
  createdByUserId,
  credits,
}: Partial<TileCreate> & Pick<TileCreate, 'createdByUserId' | 'credits'>): Promise<t.TileRaw> {
  const ctx = getTestContext()
  const scopedImagePath = scopedValue(imagePath, ctx)
  const tiles = await db.select().from(s.tiles).where(eq(s.tiles.imagePath, scopedImagePath))

  if (tiles.length > 0) return tiles[0]

  const newTile = await tileOperations.createForSupplier({
    imagePath: scopedImagePath,
    imageRatio,
    title,
    description,
    location,
    createdByUserId,
    credits,
  })
  const tile = await tileModel.getRawById(newTile.id)
  if (!tile) throw OPERATION_ERROR.RESOURCE_NOT_FOUND('Failed to create tile')

  ctx?.createdTileIds.add(tile.id)
  return tile
}

async function hasUserSupplierAndTile(): Promise<{ user: TestUserProfile; supplier: Supplier; tile: t.TileRaw }> {
  const user = await hasUser()
  const supplier = await hasSupplier({ createdByUserId: user.id })
  const tile = await hasTile({ createdByUserId: user.id, credits: [createTileCreditForm({ supplierId: supplier.id })] })
  return { user, supplier, tile }
}

async function withoutUser({
  handle = TEST_USER.handle,
  supabaseClient = testClient,
}: Partial<{ handle: string; supabaseClient: SupabaseClient }> = {}): Promise<void> {
  const scopedHandle = scopedValue(handle, getTestContext())
  const user = await userProfileModel.getRawByHandle(scopedHandle)
  if (!user) return

  await deleteAuthUserById(user.id, { supabaseClient })
}

async function withoutSupplier({ handle = TEST_SUPPLIER.handle }: Partial<{ handle: string }> = {}): Promise<void> {
  const scopedHandle = scopedValue(handle, getTestContext())
  const supplier = await supplierModel.getRawByHandle(scopedHandle)
  if (!supplier) return
  await db.delete(s.suppliers).where(eq(s.suppliers.id, supplier.id))
}

async function withoutTilesForSupplier({ supplierHandle = TEST_SUPPLIER.handle }: Partial<{ supplierHandle: string }> = {}): Promise<void> {
  const scopedHandle = scopedValue(supplierHandle, getTestContext())
  const tiles = await tileModel.getManyRawBySupplierHandle(scopedHandle)
  if (tiles.length === 0) return
  await tileModel.deleteManyByIds(tiles.map((t) => t.id))
}

async function resetTestData(): Promise<void> {
  await withoutTilesForSupplier({ supplierHandle: TEST_SUPPLIER.handle })
  await withoutSupplier({ handle: TEST_SUPPLIER.handle })
  const ctx = getTestContext()
  if (ctx) {
    await cleanupByNamespace(ctx.ns)
  }
  // Don't clean up the test user. All tests assume a user exists.
}

/**
 * Returns current test context from AsyncLocalStorage, falling back to
 * `activeTestContext` when no store is bound to the current async chain.
 */
function getTestContext(): TestContext | undefined {
  return testContextStore.getStore() ?? activeTestContext ?? undefined
}

async function cleanupByNamespace(ns: string): Promise<void> {
  const prefixPattern = `${namespacePrefix(ns).replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')}%`
  await Promise.all([
    db.delete(s.tiles).where(sql`${s.tiles.imagePath} LIKE ${prefixPattern} ESCAPE '\\'`),
    db.delete(s.suppliers).where(sql`${s.suppliers.handle} LIKE ${prefixPattern} ESCAPE '\\'`),
  ])
}

async function cleanupByPattern(): Promise<void> {
  const markerPrefixPattern = `${TEST_MARKER.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')}%`
  const users = await db
    .select({ id: s.userProfiles.id })
    .from(s.userProfiles)
    .where(
      or(sql`${s.userProfiles.handle} ILIKE ${markerPrefixPattern} ESCAPE '\\'`, sql`${s.userProfiles.displayName} ILIKE ${markerPrefixPattern} ESCAPE '\\'`)
    )

  const namespacedUserIds = users.map((user) => user.id)

  if (namespacedUserIds.length > 0) {
    await cleanupOwnedDataByUserIds(namespacedUserIds)
  }

  await Promise.all([
    db.delete(s.tiles).where(sql`${s.tiles.imagePath} ILIKE ${markerPrefixPattern} ESCAPE '\\'`),
    db.delete(s.suppliers).where(sql`${s.suppliers.handle} ILIKE ${markerPrefixPattern} ESCAPE '\\'`),
  ])

  if (users.length > 0) {
    const cleanupIssues: CleanupIssue[] = []
    for (const user of users) {
      await deleteAuthUserById(user.id, { cleanupIssues, operation: 'delete_stale_user' })
    }
    if (cleanupIssues.length > 0) {
      logCleanupIssues('Test cleanup encountered stale user deletion issues', cleanupIssues)
    }
  }
}

async function cleanupOwnedDataByUserIds(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return

  await Promise.all([
    db.delete(s.tiles).where(inArray(s.tiles.createdByUserId, userIds)),
    db.delete(s.suppliers).where(inArray(s.suppliers.createdByUserId, userIds)),
  ])
}

async function deleteAuthUserById(
  userId: string,
  {
    supabaseClient = testClient,
    cleanupIssues,
    operation = 'delete_auth_user',
  }: { supabaseClient?: SupabaseClient; cleanupIssues?: CleanupIssue[]; operation?: string } = {}
): Promise<void> {
  const { data: response, error: requestError } = await tryCatch(supabaseClient.auth.admin.deleteUser(userId))

  const authError = requestError ?? (response as { error?: Error | null } | null)?.error ?? null

  if (!authError) return

  if (cleanupIssues) {
    cleanupIssues.push(toCleanupIssue(operation, authError))
    return
  }

  throw authError
}

function toCleanupIssue(operation: string, error: unknown): CleanupIssue {
  if (error instanceof Error) {
    return {
      operation,
      message: error.message,
    }
  }

  return {
    operation,
    message: String(error),
  }
}

function logCleanupIssues(label: string, issues: CleanupIssue[]): void {
  if (issues.length === 0) return

  console.warn(label)
  issues.forEach((issue, index) => {
    console.warn(`${index + 1}. op=${issue.operation} | message=${issue.message}`)
  })
}

function scopedValue(base: string, ctx?: TestContext): string {
  if (!ctx) return base
  const prefix = namespacePrefix(ctx.ns)
  if (base.startsWith(prefix)) return base
  return `${prefix}${base}`
}

export function createTileCreditForm({
  supplierId,
  service = SERVICES.PHOTOGRAPHER,
  serviceDescription = '',
}: Partial<TileCreditForm> & Pick<TileCreditForm, 'supplierId'>): TileCreditForm {
  return {
    supplierId,
    service,
    serviceDescription,
  }
}

export function createSupplierUpdateForm({
  name,
  websiteUrl = TEST_SUPPLIER.websiteUrl,
  description = TEST_SUPPLIER.description,
}: Partial<SupplierUpdateForm> & Pick<SupplierUpdateForm, 'name'>): SupplierUpdateForm {
  return {
    name,
    websiteUrl,
    description,
  }
}

export function makeSupplierData(scope: string, overrides: Partial<TestSupplier> = {}): TestSupplier {
  const base = {
    ...TEST_SUPPLIER,
    ...overrides,
  }

  return {
    ...base,
    handle: withScope(base.handle, scope),
    name: withScope(base.name, scope),
  }
}

export function makeUserData(scope: string, overrides: Partial<TestUser> = {}): TestUser {
  const base = {
    ...TEST_USER,
    ...overrides,
  }

  return {
    ...base,
    email: withEmailScope(base.email, scope),
    handle: withScope(base.handle, scope),
    displayName: withScope(base.displayName, scope),
  }
}

export function makeTileData(scope: string, overrides: Partial<TestTile> = {}): TestTile {
  const base = {
    ...TEST_TILE,
    ...overrides,
  }

  return {
    ...base,
    imagePath: withScope(base.imagePath, scope),
  }
}

function withScope(value: string, scope: string): string {
  if (value.startsWith(scope)) return value
  return `${scope}${value}`
}

function withEmailScope(email: string, scope: string): string {
  const [localPart, domainPart] = email.split('@')
  if (!domainPart) return withScope(email, scope)
  if (localPart.startsWith(scope)) return email
  return `${scope}${localPart}@${domainPart}`
}

function namespacePrefix(ns: string): string {
  return `${TEST_MARKER}${ns}__`
}
