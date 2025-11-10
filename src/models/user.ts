import { eq } from 'drizzle-orm'

import { db } from '@/db/connection'
import * as schema from '@/db/schema'
import * as t from '@/models/types'

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
 * Creates a new user_details record.
 * Use when a new user signs up.
 * @requires id - must match the id of the Supabase Auth user
 * @param userProfileRawData - profile data to insert into the user_profiles table.
 * @example
 * ```ts
 * const { data } = await supabase.auth.signUp(credentials)
 * await userProfileModel.create({ id: data.user.id })
 * ```
 */
async function createRaw(userProfileRawData: t.InsertUserProfileRaw): Promise<t.UserProfileRaw> {
  const userProfilesRaw = await db.insert(schema.userProfiles).values(userProfileRawData).returning()
  return userProfilesRaw[0]
}

async function updateRaw(id: string, userProfileRawData: t.SetUserProfileRaw): Promise<t.UserProfileRaw> {
  userProfileRawData.updatedAt = new Date()
  if (userProfileRawData.handle) {
    userProfileRawData.handleUpdatedAt = new Date()
  }
  const userProfilesRaw = await db.update(schema.userProfiles).set(userProfileRawData).where(eq(schema.userProfiles.id, id)).returning()
  return userProfilesRaw[0]
}

/**
 * @returns true if the handle is available, false otherwise
 */
async function isHandleAvailable(handle: string): Promise<boolean> {
  const userProfilesRaw = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.handle, handle))
  return userProfilesRaw.length === 0
}
