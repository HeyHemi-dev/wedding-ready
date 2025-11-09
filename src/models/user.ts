import { eq } from 'drizzle-orm'

import { db } from '@/db/connection'
import * as schema from '@/db/schema'
import * as t from '@/models/types'

export const userProfileModel = {
  getById,
  getByHandle,
  create,
  update,
  isHandleAvailable,
}

async function getById(id: string): Promise<t.UserProfileRaw | null> {
  const userDetails = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.id, id)).limit(1)

  return userDetails.length ? userDetails[0] : null
}

async function getByHandle(handle: string): Promise<t.UserProfileRaw | null> {
  const userDetails = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.handle, handle)).limit(1)

  return userDetails.length ? userDetails[0] : null
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
async function create(userProfileRawData: t.InsertUserProfileRaw): Promise<t.UserProfileRaw> {
  const userProfileRaw = await db.insert(schema.userProfiles).values(userProfileRawData).returning()
  return userProfileRaw[0]
}

async function update(id: string, userProfileRawData: t.SetUserProfileRaw): Promise<t.UserProfileRaw> {
  if (userProfileRawData.handle) {
    userProfileRawData.handleUpdatedAt = new Date()
  }
  userProfileRawData.updatedAt = new Date()

  const userProfileRaw = await db.update(schema.userProfiles).set(userProfileRawData).where(eq(schema.userProfiles.id, id)).returning()

  return userProfileRaw[0]
}

/**
 * @returns true if the handle is available, false otherwise
 */
async function isHandleAvailable({ handle }: { handle: string }): Promise<boolean> {
  const userDetails = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.handle, handle))
  return userDetails.length === 0
}
