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
}

/**
 * Initializes per-test scene context.
 *
 * Side effects:
 * - creates a new namespaced TestContext (`ns`)
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
    ns: `${TEST_MARKER}${randomUUID().slice(0, 8)}`,
  }
  activeTestContext = ctx
  testContextStore.enterWith(ctx)
}

function namespace(): string {
  const ctx = getTestContext()
  if (!ctx) {
    throw new Error('No active test scene namespace. Call scene.setup() before using namespaced test data.')
  }

  return ctx.ns
}

/**
 * Finalizes per-test scene context and performs destructive cleanup.
 *
 * Side effects:
 * - deletes resources for the current test namespace only
 *   - owned data via `createdByUserId` for namespaced users
 *   - namespaced tiles/suppliers by namespaced fields
 *   - namespaced auth users via `testClient.auth.admin.deleteUser` (through helper)
 * - aggregates cleanup issues and may log them
 * - resets `activeTestContext` to `null`
 *
 * Call order:
 * - call after each test (typically in `afterEach`) to prevent cross-test bleed.
 */
async function cleanup(): Promise<void> {
  const ctx = getTestContext()
  if (!ctx) return

  const cleanupIssues = await cleanupByNamespace(ctx.ns)
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
  const namespacedHandle = namespacedValue(handle, ctx)
  const namespacedEmail = namespacedValue(email, ctx)

  const user = await userProfileModel.getRawByHandle(namespacedHandle)
  if (user) return { ...user, email: namespacedEmail }

  const { id } = await authOperations.signUp({ userSignFormData: { email: namespacedEmail, password }, supabaseClient, origin: TEST_ORIGIN })
  const profile = await authOperations.completeOnboarding(id, { handle: namespacedHandle, displayName, avatarUrl })

  return { ...profile, email: namespacedEmail }
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
  const namespacedHandle = namespacedValue(handle, ctx)

  const supplier = await supplierOperations.getByHandle(namespacedHandle)
  if (supplier) return supplier

  const createdSupplier = await supplierOperations.register({ name, handle: namespacedHandle, websiteUrl, description, locations, services }, createdByUserId)
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
  const namespacedImagePath = namespacedValue(imagePath, ctx)
  const tiles = await db.select().from(s.tiles).where(eq(s.tiles.imagePath, namespacedImagePath))

  if (tiles.length > 0) return tiles[0]

  const newTile = await tileOperations.createForSupplier({
    imagePath: namespacedImagePath,
    imageRatio,
    title,
    description,
    location,
    createdByUserId,
    credits,
  })
  const tile = await tileModel.getRawById(newTile.id)
  if (!tile) throw OPERATION_ERROR.RESOURCE_NOT_FOUND('Failed to create tile')

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
  const namespacedHandle = namespacedValue(handle, getTestContext())
  const user = await userProfileModel.getRawByHandle(namespacedHandle)
  if (!user) return

  await deleteAuthUserById(user.id, { supabaseClient })
}

async function withoutSupplier({ handle = TEST_SUPPLIER.handle }: Partial<{ handle: string }> = {}): Promise<void> {
  const namespacedHandle = namespacedValue(handle, getTestContext())
  const supplier = await supplierModel.getRawByHandle(namespacedHandle)
  if (!supplier) return
  await db.delete(s.suppliers).where(eq(s.suppliers.id, supplier.id))
}

async function withoutTilesForSupplier({ supplierHandle = TEST_SUPPLIER.handle }: Partial<{ supplierHandle: string }> = {}): Promise<void> {
  const namespacedHandle = namespacedValue(supplierHandle, getTestContext())
  const tiles = await tileModel.getManyRawBySupplierHandle(namespacedHandle)
  if (tiles.length === 0) return
  await tileModel.deleteManyByIds(tiles.map((t) => t.id))
}

/**
 * Returns current test context from AsyncLocalStorage, falling back to
 * `activeTestContext` when no store is bound to the current async chain.
 */
function getTestContext(): TestContext | undefined {
  return testContextStore.getStore() ?? activeTestContext ?? undefined
}

async function cleanupByNamespace(ns: string): Promise<CleanupIssue[]> {
  const prefixPattern = `${ns.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')}%`
  const cleanupIssues: CleanupIssue[] = []

  const { data: users, error: usersError } = await tryCatch(
    db
      .select({ id: s.userProfiles.id })
      .from(s.userProfiles)
      .where(or(sql`${s.userProfiles.handle} ILIKE ${prefixPattern} ESCAPE '\\'`, sql`${s.userProfiles.displayName} ILIKE ${prefixPattern} ESCAPE '\\'`))
  )
  if (usersError) {
    cleanupIssues.push(toCleanupIssue('select_namespaced_users', usersError))
  }

  const namespacedUserIds = users?.map((user) => user.id) ?? []
  if (namespacedUserIds.length > 0) {
    const { error: ownedDataCleanupError } = await tryCatch(cleanupOwnedDataByUserIds(namespacedUserIds))
    if (ownedDataCleanupError) {
      cleanupIssues.push(toCleanupIssue('cleanup_owned_data_by_user', ownedDataCleanupError))
    }
  }

  const { error: tilesDeleteError } = await tryCatch(db.delete(s.tiles).where(sql`${s.tiles.imagePath} ILIKE ${prefixPattern} ESCAPE '\\'`))
  if (tilesDeleteError) {
    cleanupIssues.push(toCleanupIssue('delete_namespaced_tiles', tilesDeleteError))
  }

  const { error: suppliersDeleteError } = await tryCatch(db.delete(s.suppliers).where(sql`${s.suppliers.handle} ILIKE ${prefixPattern} ESCAPE '\\'`))
  if (suppliersDeleteError) {
    cleanupIssues.push(toCleanupIssue('delete_namespaced_suppliers', suppliersDeleteError))
  }

  for (const userId of namespacedUserIds) {
    await deleteAuthUserById(userId, { cleanupIssues, operation: 'delete_namespaced_user' })
  }

  return cleanupIssues
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

  console.error(label)
  issues.forEach((issue, index) => {
    console.error(`${index + 1}. op=${issue.operation} | message=${issue.message}`)
  })
}

function namespacedValue(base: string, ctx?: TestContext): string {
  if (!ctx) return base
  const prefix = ctx.ns
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

export function makeSupplierData(namespace: string, overrides: Partial<TestSupplier> = {}): TestSupplier {
  const base = {
    ...TEST_SUPPLIER,
    ...overrides,
  }

  return {
    ...base,
    handle: withNamespace(base.handle, namespace),
    name: withNamespace(base.name, namespace),
  }
}

export function makeUserData(namespace: string, overrides: Partial<TestUser> = {}): TestUser {
  const base = {
    ...TEST_USER,
    ...overrides,
  }

  return {
    ...base,
    email: withNamespace(base.email, namespace),
    handle: withNamespace(base.handle, namespace),
    displayName: withNamespace(base.displayName, namespace),
  }
}

export function makeTileData(namespace: string, overrides: Partial<TestTile> = {}): TestTile {
  const base = {
    ...TEST_TILE,
    ...overrides,
  }
  const imagePath = overrides.imagePath ?? `${TEST_TILE.imagePath}-${randomUUID()}.jpg`

  return {
    ...base,
    imagePath: withNamespace(imagePath, namespace),
  }
}

function withNamespace(value: string, namespace: string): string {
  if (value.startsWith(namespace)) return value
  return `${namespace}${value}`
}
