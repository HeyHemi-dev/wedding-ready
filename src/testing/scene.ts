import { eq, ilike, inArray, like, or } from 'drizzle-orm'
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
  code?: string
  status?: number
}

const IGNORED_CLEANUP_CODES = new Set(['user_not_found'])

const testContextStore = new AsyncLocalStorage<TestContext>()
let activeTestContext: TestContext | null = null

type TestUserProfile = t.UserProfileRaw & { email: string }

export const scene = {
  startTest,
  endTest,
  scope,
  cleanupStaleNamespacedData,
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

function startTest(): void {
  const ctx: TestContext = {
    ns: randomUUID().slice(0, 8),
    createdUserIds: new Set(),
    createdSupplierIds: new Set(),
    createdTileIds: new Set(),
  }
  activeTestContext = ctx
  testContextStore.enterWith(ctx)
}

function getTestContext(): TestContext | undefined {
  return testContextStore.getStore() ?? activeTestContext ?? undefined
}

function scope(): string {
  const ctx = getTestContext()
  if (!ctx) {
    throw new Error('No active test scene scope. Call scene.startTest() before using scoped test data.')
  }

  return `${TEST_MARKER}${ctx.ns}`
}

async function endTest(): Promise<void> {
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

  const { error: namespaceError } = await tryCatch(cleanupByNamespace(ctx.ns))
  if (namespaceError) {
    cleanupIssues.push(toCleanupIssue('cleanup_namespace', namespaceError))
  }

  if (ctx.createdUserIds.size > 0) {
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

async function cleanupStaleNamespacedData(): Promise<void> {
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
  const scopedEmail = scopedEmailValue(email, ctx)

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
  const scopedImagePath = scopedPathValue(imagePath, ctx)
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

async function cleanupByNamespace(ns: string): Promise<void> {
  await Promise.all([
    db.delete(s.tiles).where(like(s.tiles.imagePath, `%${TEST_MARKER}${ns}`)),
    db.delete(s.suppliers).where(like(s.suppliers.handle, `%${TEST_MARKER}${ns}`)),
  ])
}

async function cleanupByPattern(): Promise<void> {
  const users = await db
    .select({ id: s.userProfiles.id })
    .from(s.userProfiles)
    .where(or(ilike(s.userProfiles.handle, `%${TEST_MARKER}%`), ilike(s.userProfiles.displayName, `%${TEST_MARKER}%`)))

  const namespacedUserIds = users.map((user) => user.id)

  if (namespacedUserIds.length > 0) {
    await Promise.all([
      db.delete(s.tiles).where(inArray(s.tiles.createdByUserId, namespacedUserIds)),
      db.delete(s.suppliers).where(inArray(s.suppliers.createdByUserId, namespacedUserIds)),
    ])
  }

  await Promise.all([
    db.delete(s.tiles).where(ilike(s.tiles.imagePath, `%${TEST_MARKER}%`)),
    db.delete(s.suppliers).where(ilike(s.suppliers.handle, `%${TEST_MARKER}%`)),
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

async function deleteAuthUserById(
  userId: string,
  {
    supabaseClient = testClient,
    cleanupIssues,
    operation = 'delete_auth_user',
  }: { supabaseClient?: SupabaseClient; cleanupIssues?: CleanupIssue[]; operation?: string } = {}
): Promise<void> {
  const { data: response, error: requestError } = await tryCatch(supabaseClient.auth.admin.deleteUser(userId))

  const authError =
    requestError ??
    ((response as { error?: Error | null } | null)?.error ??
      null)

  if (!authError) return
  const issue = toCleanupIssue(operation, authError)
  if (isIgnorableCleanupIssue(issue)) return

  if (cleanupIssues) {
    cleanupIssues.push(issue)
    return
  }

  throw authError
}

function toCleanupIssue(operation: string, error: unknown): CleanupIssue {
  if (error instanceof Error) {
    const errorWithMetadata = error as Error & { code?: string; status?: number }
    return {
      operation,
      message: error.message,
      code: errorWithMetadata.code,
      status: errorWithMetadata.status,
    }
  }

  return {
    operation,
    message: String(error),
  }
}

function logCleanupIssues(label: string, issues: CleanupIssue[]): void {
  const relevantIssues = issues.filter((issue) => !isIgnorableCleanupIssue(issue))
  if (relevantIssues.length === 0) return

  console.warn(label)
  relevantIssues.forEach((issue, index) => {
    const parts = [`${index + 1}. op=${issue.operation}`, `message=${issue.message}`]
    if (issue.code) parts.push(`code=${issue.code}`)
    if (typeof issue.status === 'number') parts.push(`status=${issue.status}`)
    console.warn(parts.join(' | '))
  })
}

function isIgnorableCleanupIssue(issue: CleanupIssue): boolean {
  if (issue.code && IGNORED_CLEANUP_CODES.has(issue.code)) return true
  return issue.status === 404 && issue.operation.includes('delete_')
}

function scopedValue(base: string, ctx?: TestContext): string {
  if (!ctx) return base
  if (base.includes(`${TEST_MARKER}${ctx.ns}`)) return base
  return `${base}${TEST_MARKER}${ctx.ns}`
}

function scopedEmailValue(base: string, ctx?: TestContext): string {
  if (!ctx) return base

  const [localPart, domainPart] = base.split('@')
  if (!domainPart) return scopedValue(base, ctx)

  if (localPart.includes(`${TEST_MARKER}${ctx.ns}`)) return base

  return `${localPart}${TEST_MARKER}${ctx.ns}@${domainPart}`
}

function scopedPathValue(base: string, ctx?: TestContext): string {
  return scopedValue(base, ctx)
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
  return {
    ...TEST_SUPPLIER,
    handle: `${TEST_SUPPLIER.handle}${scope}`,
    name: `${TEST_SUPPLIER.name}${scope}`,
    ...overrides,
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
  if (value.includes(scope)) return value
  return `${value}${scope}`
}

function withEmailScope(email: string, scope: string): string {
  const [localPart, domainPart] = email.split('@')
  if (!domainPart) return withScope(email, scope)
  if (localPart.includes(scope)) return email
  return `${localPart}${scope}@${domainPart}`
}
