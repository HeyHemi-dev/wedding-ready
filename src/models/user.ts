import { eq } from 'drizzle-orm'

import { db } from '@/db/connection'
import * as schema from '@/db/schema'
import { InsertUserDetailRaw, SetUserDetailRaw, UserDetailRaw } from '@/models/types'

export class UserDetailModel {
  private userDetailRaw: UserDetailRaw

  constructor(userDetailRaw: UserDetailRaw) {
    this.userDetailRaw = userDetailRaw
  }

  // Class method example
  static async getById(id: string): Promise<UserDetailRaw | null> {
    const userDetails = await db.select().from(schema.user_details).where(eq(schema.user_details.id, id)).limit(1)

    return userDetails.length ? userDetails[0] : null
  }

  static async getByHandle(handle: string): Promise<UserDetailRaw | null> {
    const userDetails = await db.select().from(schema.user_details).where(eq(schema.user_details.handle, handle)).limit(1)

    return userDetails.length ? userDetails[0] : null
  }

  /**
   * Creates a new user_details record.
   * Use when a new user signs up.
   * @requires id - must match the id of the Supabase Auth user
   * @param userDetailRawData - extended user data to insert into the user_details table.
   * @example
   * ```ts
   * const { data } = await supabase.auth.signUp(credentials)
   * await UserDetailActions.create({ id: data.user.id })
   * ```
   */
  static async create(userDetailRawData: InsertUserDetailRaw): Promise<UserDetailRaw> {
    const userDetailsRaw = await db.insert(schema.user_details).values(userDetailRawData).returning()
    return userDetailsRaw[0]
  }

  static async update(id: string, userDetailRawData: SetUserDetailRaw): Promise<UserDetailRaw> {
    if (userDetailRawData.handle) {
      userDetailRawData.handleUpdatedAt = new Date()
    }
    userDetailRawData.updatedAt = new Date()

    const userDetailsRaw = await db.update(schema.user_details).set(userDetailRawData).where(eq(schema.user_details.id, id)).returning()

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
    const userDetails = await db.select().from(schema.user_details).where(eq(schema.user_details.handle, handle))
    return userDetails.length === 0
  }
}
