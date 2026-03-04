import { eq, inArray, sql } from 'drizzle-orm'
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
export const TEST_ORIGIN = BASE_URL
export const TEST_ID = '123e4567-e89b-4123-a456-426614174000'
export const TEST_ID_0 = '00000000-0000-4000-8000-000000000000'
export const TEST_ID_F = 'ffffffff-ffff-4fff-bfff-ffffffffffff'

export type TestUser = UserSignupForm & Pick<OnboardingForm, 'displayName' | 'handle'>
export type TestUserProfile = t.UserProfileRaw & { email: string }
export type TestSupplier = SupplierRegistrationForm
export type TestTile = Omit<TileCreate, 'createdByUserId' | 'credits'>

export const TEST_USER = {
  email: 'test.user@example.com',
  password: 'testpassword123',
  displayName: 'Test User',
  handle: 'testuser',
} satisfies TestUser

export const TEST_SUPPLIER = {
  name: 'Test Supplier',
  handle: 'testsupplier',
  websiteUrl: 'https://example.com',
  description: 'Test Supplier Description',
  locations: [LOCATIONS.WELLINGTON, LOCATIONS.AUCKLAND, LOCATIONS.CANTERBURY],
  services: [SERVICES.PHOTOGRAPHER, SERVICES.VIDEOGRAPHER],
} satisfies TestSupplier

export const TEST_TILE = {
  imagePath: 'https://example.com/fake-image.jpg',
  imageRatio: 0.667,
  title: '',
  description: '',
  location: LOCATIONS.WELLINGTON,
} satisfies TestTile

const TEST_MARKER = '__t_'
type SceneContext = {
  ns: string
  isTest: boolean
}
type CleanupIssue = {
  operation: string
  message: string
}

// Canonical namespaced marker columns used for cleanup lookups.
// user_profiles.handle is the stable identity for test user-profile rows.
// suppliers.handle and tiles.imagePath are stable unique test markers.
const CLEANUP_MARKER_COLUMNS = {
  userProfile: s.userProfiles.handle,
  supplier: s.suppliers.handle,
  tile: s.tiles.imagePath,
} as const

const sceneContextStore = new AsyncLocalStorage<SceneContext>()
let activeSceneContext: SceneContext | null = null

export const scene = {
  setup,
  context,
  cleanup,
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
 * - creates a new SceneContext (`ns` may be empty when `isTest: false`)
 * - mutates `activeSceneContext`
 * - writes context into AsyncLocalStorage via `sceneContextStore.enterWith(ctx)`
 *
 * Call order:
 * - call before creating test resources (typically in `beforeEach`)
 *
 * Concurrency:
 * - context is per async call-chain; each concurrent test must call `setup`
 *   in its own lifecycle to avoid sharing fallback `activeSceneContext`.
 */
function setup({ isTest = true }: { isTest?: boolean } = {}): void {
  const ctx: SceneContext = {
    ns: isTest ? `${TEST_MARKER}${randomUUID().slice(0, 8)}` : '',
    isTest,
  }
  activeSceneContext = ctx
  sceneContextStore.enterWith(ctx)
}

/** Returns the active scene context; call in the current test lifecycle. Throws if scene.setup() has not been called. */
function context(): SceneContext {
  return getSceneContext()
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
 * - resets `activeSceneContext` to `null`
 *
 * Call order:
 * - call after each test (typically in `afterEach`) to prevent cross-test bleed.
 */
async function cleanup(): Promise<void> {
  const cleanupIssues: CleanupIssue[] = []
  const ctx = getSceneContext()
  if (!ctx.isTest) {
    throw OPERATION_ERROR.INVALID_STATE('scene.cleanup() requires a test-scoped scene context.')
  }
  const prefixPattern = `${ctx.ns.replace(/_/g, '\\_')}%`

  const { data: users, error: usersError } = await tryCatch(
    db
      .select({ id: s.userProfiles.id })
      .from(s.userProfiles)
      .where(sql`${CLEANUP_MARKER_COLUMNS.userProfile} LIKE ${prefixPattern} ESCAPE '\\'`)
  )
  if (usersError) {
    cleanupIssues.push(toCleanupIssue('select_namespaced_users', usersError))
  }

  const userIds = users?.map((user) => user.id) ?? []
  if (userIds.length > 0) {
    const { error: userDataCleanupError } = await tryCatch(cleanupDataByUserIds(userIds))
    if (userDataCleanupError) {
      cleanupIssues.push(toCleanupIssue('cleanup_user_data', userDataCleanupError))
    }
  }

  const { error: tilesCleanupError } = await tryCatch(db.delete(s.tiles).where(sql`${CLEANUP_MARKER_COLUMNS.tile} LIKE ${prefixPattern} ESCAPE '\\'`))
  if (tilesCleanupError) {
    cleanupIssues.push(toCleanupIssue('cleanup_tiles', tilesCleanupError))
  }

  const { error: suppliersCleanupError } = await tryCatch(
    db.delete(s.suppliers).where(sql`${CLEANUP_MARKER_COLUMNS.supplier} LIKE ${prefixPattern} ESCAPE '\\'`)
  )
  if (suppliersCleanupError) {
    cleanupIssues.push(toCleanupIssue('cleanup_suppliers', suppliersCleanupError))
  }

  for (const userId of userIds) {
    await cleanupAuthByUserId(userId, { cleanupIssues, operation: 'cleanup_auth_user' })
  }

  activeSceneContext = null
  if (cleanupIssues.length > 0) {
    logCleanupIssues('Test cleanup encountered issues', cleanupIssues)
  }
}

/**
 * Removes stale namespaced test data not tied to current in-memory context.
 *
 * Side effects:
 * - performs broad stale namespaced cleanup by marker prefix.
 *
 * Usage:
 * - intended for global setup/teardown safety net, not primary per-test cleanup.
 */
async function cleanupStaleData(): Promise<void> {
  const prefixPattern = `${TEST_MARKER.replace(/_/g, '\\_')}%`
  const users = await db
    .select({ id: s.userProfiles.id })
    .from(s.userProfiles)
    .where(sql`${CLEANUP_MARKER_COLUMNS.userProfile} LIKE ${prefixPattern} ESCAPE '\\'`)

  const userIds = users.map((user) => user.id)

  if (userIds.length > 0) {
    await cleanupDataByUserIds(userIds)
  }

  await Promise.all([
    db.delete(s.tiles).where(sql`${CLEANUP_MARKER_COLUMNS.tile} LIKE ${prefixPattern} ESCAPE '\\'`),
    db.delete(s.suppliers).where(sql`${CLEANUP_MARKER_COLUMNS.supplier} LIKE ${prefixPattern} ESCAPE '\\'`),
  ])

  if (users.length > 0) {
    const cleanupIssues: CleanupIssue[] = []
    for (const user of users) {
      await cleanupAuthByUserId(user.id, { cleanupIssues, operation: 'delete_stale_user' })
    }
    if (cleanupIssues.length > 0) {
      logCleanupIssues('Test cleanup encountered stale user deletion issues', cleanupIssues)
    }
  }
}

/** Returns an existing namespaced user for the active scene, or creates one when missing. */
async function hasUser({
  email = TEST_USER.email,
  password = TEST_USER.password,
  displayName = TEST_USER.displayName,
  handle = TEST_USER.handle,
  avatarUrl = '',
  supabaseClient = testClient,
}: Partial<UserSignupForm> & Partial<OnboardingForm> & { supabaseClient?: SupabaseClient } = {}): Promise<TestUserProfile> {
  const ctx = getSceneContext()
  const userData = makeUserData(ctx, { email, handle, displayName, password })

  const user = await userProfileModel.getRawByHandle(userData.handle)
  if (user) return { ...user, email: userData.email }

  const { id } = await authOperations.signUp({ userSignFormData: { email: userData.email, password }, supabaseClient, origin: TEST_ORIGIN })
  const profile = await authOperations.completeOnboarding(id, { handle: userData.handle, displayName: userData.displayName, avatarUrl })

  return { ...profile, email: userData.email }
}

/** Returns an existing namespaced supplier for the active scene, or registers one when missing. */
async function hasSupplier({
  name = TEST_SUPPLIER.name,
  handle = TEST_SUPPLIER.handle,
  websiteUrl = TEST_SUPPLIER.websiteUrl,
  description = TEST_SUPPLIER.description,
  locations = TEST_SUPPLIER.locations,
  services = TEST_SUPPLIER.services,
  createdByUserId,
}: Partial<SupplierRegistrationForm> & { createdByUserId: string }): Promise<Supplier> {
  const ctx = getSceneContext()
  const supplierData = makeSupplierData(ctx, { name, handle, websiteUrl, description, locations, services })

  const supplier = await supplierOperations.getByHandle(supplierData.handle)
  if (supplier) return supplier

  const createdSupplier = await supplierOperations.register(supplierData, createdByUserId)
  return createdSupplier
}

async function hasUserAndSupplier(): Promise<{ user: TestUserProfile; supplier: Supplier }> {
  const user = await hasUser()
  const supplier = await hasSupplier({ createdByUserId: user.id })
  return { user, supplier }
}

/** Returns an existing namespaced tile for the active scene, or creates one when missing. */
async function hasTile({
  imagePath = TEST_TILE.imagePath,
  imageRatio = TEST_TILE.imageRatio,
  title = TEST_TILE.title,
  description = TEST_TILE.description,
  location = TEST_TILE.location,
  createdByUserId,
  credits,
}: Partial<TileCreate> & Pick<TileCreate, 'createdByUserId' | 'credits'>): Promise<t.TileRaw> {
  const ctx = getSceneContext()
  const tileData = makeTileData(ctx, { imagePath, imageRatio, title, description, location })
  const tiles = await db.select().from(s.tiles).where(eq(s.tiles.imagePath, tileData.imagePath))

  if (tiles.length > 0) return tiles[0]

  const newTile = await tileOperations.createForSupplier({
    ...tileData,
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
  const tile = await hasTile({ createdByUserId: user.id, credits: [makeTileCreditData({ supplierId: supplier.id })] })
  return { user, supplier, tile }
}

/** Deletes a namespaced user by handle when present. */
async function withoutUser({
  handle = TEST_USER.handle,
  supabaseClient = testClient,
}: Partial<{ handle: string; supabaseClient: SupabaseClient }> = {}): Promise<void> {
  const namespacedHandle = withNamespace(handle, getSceneContext())
  const user = await userProfileModel.getRawByHandle(namespacedHandle)
  if (!user) return

  await cleanupAuthByUserId(user.id, { supabaseClient })
}

/** Deletes a namespaced supplier by handle when present. */
async function withoutSupplier({ handle = TEST_SUPPLIER.handle }: Partial<{ handle: string }> = {}): Promise<void> {
  const namespacedHandle = withNamespace(handle, getSceneContext())
  const supplier = await supplierModel.getRawByHandle(namespacedHandle)
  if (!supplier) return
  await db.delete(s.suppliers).where(eq(s.suppliers.id, supplier.id))
}

/** Deletes all tiles linked to a namespaced supplier handle. */
async function withoutTilesForSupplier({ supplierHandle = TEST_SUPPLIER.handle }: Partial<{ supplierHandle: string }> = {}): Promise<void> {
  const namespacedHandle = withNamespace(supplierHandle, getSceneContext())
  const tiles = await tileModel.getManyRawBySupplierHandle(namespacedHandle)
  if (tiles.length === 0) return
  await tileModel.deleteManyByIds(tiles.map((t) => t.id))
}

/**
 * Returns current scene context from AsyncLocalStorage, falling back to
 * `activeSceneContext` when no store is bound to the current async chain.
 */
function getSceneContext(): SceneContext {
  const ctx = sceneContextStore.getStore() ?? activeSceneContext ?? undefined
  if (!ctx) {
    throw OPERATION_ERROR.INVALID_STATE('No active scene context. Call scene.setup() before using scene utilities.')
  }

  return ctx
}

/** Deletes user-owned rows for the provided user IDs across `tiles` and `suppliers`. */
async function cleanupDataByUserIds(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return

  await Promise.all([
    db.delete(s.tiles).where(inArray(s.tiles.createdByUserId, userIds)),
    db.delete(s.suppliers).where(inArray(s.suppliers.createdByUserId, userIds)),
  ])
}

/** Deletes an auth user by id; pushes to `cleanupIssues` when provided, otherwise throws on failure. */
async function cleanupAuthByUserId(
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

/** Internal helper to prefix a raw value with the active scene namespace. */
function withNamespace(base: string, ctx: SceneContext): string {
  if (!ctx.isTest) return base
  return `${ctx.ns}${base}`
}

export function makeTileCreditData({
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

export function makeSupplierUpdateData({
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

export function makeSupplierData(context: SceneContext, overrides: Partial<TestSupplier> = {}): TestSupplier {
  const base = {
    ...TEST_SUPPLIER,
    ...overrides,
  }

  return {
    ...base,
    handle: withNamespace(base.handle, context),
  }
}

export function makeUserData(context: SceneContext, overrides: Partial<TestUser> = {}): TestUser {
  const base = {
    ...TEST_USER,
    ...overrides,
  }

  return {
    ...base,
    email: withNamespace(base.email, context),
    handle: withNamespace(base.handle, context),
  }
}

export function makeTileData(context: SceneContext, overrides: Partial<TestTile> = {}): TestTile {
  const base = {
    ...TEST_TILE,
    ...overrides,
  }
  const imagePath = overrides.imagePath ?? `${TEST_TILE.imagePath}-${randomUUID()}.jpg`

  return {
    ...base,
    imagePath: withNamespace(imagePath, context),
  }
}
