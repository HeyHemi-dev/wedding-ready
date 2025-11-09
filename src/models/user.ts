import { eq } from 'drizzle-orm'

import { db } from '@/db/connection'
import * as schema from '@/db/schema'
import * as t from '@/models/types'

export class UserDetailModel {
  private userDetailRaw: t.UserProfileRaw

  constructor(userDetailRaw: t.UserProfileRaw) {
    this.userDetailRaw = userDetailRaw
  }

  // Class method example
  static async getById(id: string): Promise<t.UserProfileRaw | null> {
    const userDetails = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.id, id)).limit(1)

    return userDetails.length ? userDetails[0] : null
  }

  static async getByHandle(handle: string): Promise<t.UserProfileRaw | null> {
    const userDetails = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.handle, handle)).limit(1)

    return userDetails.length ? userDetails[0] : null
  }

  /**
   * Creates a new user_details record.
   * Use when a new user signs up.
   * @requires id - must match the id of the Supabase Auth user
   * @param userProfileRawData - extended user data to insert into the user_profiles table.
   * @example
   * ```ts
   * const { data } = await supabase.auth.signUp(credentials)
   * await UserDetailActions.create({ id: data.user.id })
   * ```
   */
  static async create(userProfileRawData: t.InsertUserProfileRaw): Promise<t.UserProfileRaw> {
    const userDetailsRaw = await db.insert(schema.userProfiles).values(userProfileRawData).returning()
    return userDetailsRaw[0]
  }

  static async update(id: string, userDetailRawData: t.SetUserProfileRaw): Promise<t.UserProfileRaw> {
    if (userDetailRawData.handle) {
      userDetailRawData.handleUpdatedAt = new Date()
    }
    userDetailRawData.updatedAt = new Date()

    const userDetailsRaw = await db.update(schema.userProfiles).set(userDetailRawData).where(eq(schema.userProfiles.id, id)).returning()

    return userDetailsRaw[0]
  }

  // Hybrid method example
  async hasAvatar(): Promise<boolean> {
    return this.userDetailRaw.avatarUrl !== null
  }
  /**
   * @returns true if the handle is available, false otherwise
   */
  static async isHandleAvailable({ handle }: { handle: string }): Promise<boolean> {
    const userDetails = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.handle, handle))
    return userDetails.length === 0
  }
}
