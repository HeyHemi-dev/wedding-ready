import { eq } from 'drizzle-orm'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { db } from '@/db/connection'
import * as schema from '@/db/schema'
import * as t from '@/models/types'
import { emptyStringToNull } from '@/utils/empty-strings'

export const userProfileModel = {
  getRawById,
  getRawByHandle,
  createRaw,
  updateRaw,
  isHandleAvailable,
}

async function getRawById(id: string): Promise<t.UserProfileRaw | null> {
  const userProfilesRaw = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.id, id)).limit(1)

  return userProfilesRaw.length ? userProfilesRaw[0] : null
}

async function getRawByHandle(handle: string): Promise<t.UserProfileRaw | null> {
  const userProfilesRaw = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.handle, handle)).limit(1)

  return userProfilesRaw.length ? userProfilesRaw[0] : null
}

/**
 * Creates a new user profile record. Use when a new user signs up.
 * @requires id - must match the id of the Supabase Auth user
 * @example
 * ```ts
 * const { data } = await supabase.auth.signUp(credentials)
 * await userProfileModel.createRaw({ id: data.user.id })
 * ```
 */
async function createRaw(userProfileRawData: t.InsertUserProfileRaw): Promise<t.UserProfileRaw> {
  const userProfilesRaw = await db.insert(schema.userProfiles).values(safeInsertUserProfileRaw(userProfileRawData)).returning()
  return userProfilesRaw[0]
}

async function updateRaw(id: string, userProfileRawData: t.SetUserProfileRaw): Promise<t.UserProfileRaw> {
  userProfileRawData.updatedAt = new Date()
  if (userProfileRawData.handle) {
    userProfileRawData.handleUpdatedAt = new Date()
  }
  const userProfilesRaw = await db.update(schema.userProfiles).set(safeSetUserProfileRaw(userProfileRawData)).where(eq(schema.userProfiles.id, id)).returning()
  if (userProfilesRaw.length === 0) throw OPERATION_ERROR.RESOURCE_CONFLICT()
  return userProfilesRaw[0]
}

/**
 * @returns true if the handle is available, false otherwise
 */
async function isHandleAvailable(handle: string): Promise<boolean> {
  const userProfilesRaw = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.handle, handle))
  return userProfilesRaw.length === 0
}

function safeInsertUserProfileRaw(data: t.InsertUserProfileRaw): t.InsertUserProfileRaw {
  const now = new Date()
  return {
    id: data.id,
    handle: data.handle,
    displayName: data.displayName,
    createdAt: now,
    updatedAt: now,
    handleUpdatedAt: now,
    bio: emptyStringToNull(data.bio),
    avatarUrl: emptyStringToNull(data.avatarUrl),
    instagramUrl: emptyStringToNull(data.instagramUrl),
    tiktokUrl: emptyStringToNull(data.tiktokUrl),
    websiteUrl: emptyStringToNull(data.websiteUrl),
  } satisfies t.InsertUserProfileRaw
}

function safeSetUserProfileRaw(data: t.SetUserProfileRaw): t.SetUserProfileRaw {
  const now = new Date()
  return {
    updatedAt: now,
    handle: data.handle,
    handleUpdatedAt: data.handle ? now : undefined,
    displayName: data.displayName,
    bio: emptyStringToNull(data.bio),
    avatarUrl: emptyStringToNull(data.avatarUrl),
    instagramUrl: emptyStringToNull(data.instagramUrl),
    tiktokUrl: emptyStringToNull(data.tiktokUrl),
    websiteUrl: emptyStringToNull(data.websiteUrl),
  } satisfies t.SetUserProfileRaw
}
