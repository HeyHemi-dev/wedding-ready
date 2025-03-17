import { db } from '@/db/db'
import { user_details as userDetailsTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { InsertUserDetailRaw, UserDetailRaw } from '@/models/types'

class UserDetailActions {
  private userDetail: UserDetailRaw

  constructor(userDetail: UserDetailRaw) {
    this.userDetail = userDetail
  }

  // Class method example
  static async getById(id: string): Promise<UserDetailRaw | null> {
    const userDetails = await db.select().from(userDetailsTable).where(eq(userDetailsTable.id, id)).limit(1)

    return userDetails.length ? userDetails[0] : null
  }

  /**
   * Creates a new user_details record.
   * Use when a new user signs up.
   * @requires id - must match the id of the Supabase Auth user
   * @param insertUserData - extended user data to insert into the user_details table.
   * @example
   * ```ts
   * const { data } = await supabase.auth.signUp(credentials)
   * await UserDetailActions.create({ id: data.user.id })
   * ```
   */
  static async create(insertUserData: InsertUserDetailRaw): Promise<UserDetailRaw> {
    const userDetails = await db.insert(userDetailsTable).values(insertUserData).returning()
    return userDetails[0]
  }

  // Instance method example
  async update(insertUserData: InsertUserDetailRaw): Promise<UserDetailRaw> {
    const userDetails = await db.update(userDetailsTable).set(insertUserData).where(eq(userDetailsTable.id, this.userDetail.id)).returning()

    this.userDetail = userDetails[0]
    return this.userDetail
  }

  // Hybrid method example
  async hasAvatar(): Promise<boolean> {
    return this.userDetail.avatarUrl !== null
  }

  static async isHandleAvailable(handle: string): Promise<boolean> {
    const userDetails = await db.select().from(userDetailsTable).where(eq(userDetailsTable.handle, handle))
    return userDetails.length === 0
  }
}

export default UserDetailActions
