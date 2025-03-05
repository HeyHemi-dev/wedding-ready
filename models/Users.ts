import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { stacks, stackTiles, user_details } from '@/db/schema'
import { User as AuthUser } from '@supabase/supabase-js'

export type User = AuthUser

/**
 * A UserDetail (no 's') represents a single row in the user_details table and is used to extend the Supabase Auth user with additional fields.
 */
export type UserDetail = InferSelectModel<typeof user_details>

/**
 * UserDetail is used to extend the Supabase Auth user with additional fields.
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

// Stacks belong to a user which is why we are defining the type here
export type Stack = InferSelectModel<typeof stacks>
export type InsertStack = InferInsertModel<typeof stacks>

export type StackTile = InferSelectModel<typeof stackTiles>
export type InsertStackTile = InferInsertModel<typeof stackTiles>
