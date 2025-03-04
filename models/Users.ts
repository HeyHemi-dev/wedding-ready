import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { user_details } from '@/db/schema'
import { User } from '@supabase/supabase-js'

/**
 * UserDetail represents a row in the user_details table
 */
export type UserDetail = InferSelectModel<typeof user_details>

/**
 * @requires id - must match the id of the Supabase Auth user
 */
export type InsertUserDetail = InferInsertModel<typeof user_details>

/**
 * UserWithDetail combines Supabase Auth user with user_details fields.
 */
export interface UserWithDetail extends User {
  extended: UserDetail
}

/**
 * Combines a Supabase Auth user and UserDetail.
 */
export function makeUserWithDetail(user: User, userDetail: UserDetail): UserWithDetail {
  return {
    ...user,
    extended: userDetail,
  } as UserWithDetail
}
