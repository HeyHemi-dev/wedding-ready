import { InferSelectModel, InferInsertModel, getTableColumns } from 'drizzle-orm'
import * as schema from '@/db/schema'
import { Service, Location } from '@/models/constants'
import { User as AuthUser } from '@supabase/supabase-js'

export type User = AuthUser

/**
 * A UserDetail (no 's') represents a single row in the user_details table and is used to extend the Supabase Auth user with additional fields.
 */
export type UserDetail = InferSelectModel<typeof schema.user_details>

/**
 * UserDetail is used to extend the Supabase Auth user with additional fields.
 * @requires id - must match the id of the Supabase Auth user
 */
export type InsertUserDetail = InferInsertModel<typeof schema.user_details>

export type Supplier = InferSelectModel<typeof schema.suppliers>
export type InsertSupplier = InferInsertModel<typeof schema.suppliers>
export const supplierColumns = getTableColumns(schema.suppliers)

export type SupplierLocation = InferSelectModel<typeof schema.supplierLocations>
export type InsertSupplierLocation = InferInsertModel<typeof schema.supplierLocations>
export const supplierLocationColumns = getTableColumns(schema.supplierLocations)

export type SupplierService = InferSelectModel<typeof schema.supplierServices>
export type InsertSupplierService = InferInsertModel<typeof schema.supplierServices>
export const supplierServiceColumns = getTableColumns(schema.supplierServices)

export type SupplierUser = InferSelectModel<typeof schema.supplierUsers>
export type InsertSupplierUser = InferInsertModel<typeof schema.supplierUsers>
export const supplierUserColumns = getTableColumns(schema.supplierUsers)

export type Stack = InferSelectModel<typeof schema.stacks>
export type InsertStack = InferInsertModel<typeof schema.stacks>
export const stackColumns = getTableColumns(schema.stacks)

export type StackTile = InferSelectModel<typeof schema.stackTiles>
export type InsertStackTile = InferInsertModel<typeof schema.stackTiles>
export const stackTileColumns = getTableColumns(schema.stackTiles)

export type TileRaw = InferSelectModel<typeof schema.tiles>
export type InsertTileRaw = InferInsertModel<typeof schema.tiles>
export const tileColumns = getTableColumns(schema.tiles)

export type SavedTile = InferSelectModel<typeof schema.savedTiles>
export type InsertSavedTile = InferInsertModel<typeof schema.savedTiles>
export const savedTileColumns = getTableColumns(schema.savedTiles)

export type TileSupplier = InferSelectModel<typeof schema.tileSuppliers>
export type InsertTileSupplier = InferInsertModel<typeof schema.tileSuppliers>
export const tileSupplierColumns = getTableColumns(schema.tileSuppliers)

/**
 * UserWithDetail extends Supabase Auth user with user_details fields.
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

/**
 * SupplierWithDetail extends a Supplier with its services and locations.
 */
export interface SupplierWithDetail extends Supplier {
  services: Service[]
  locations: Location[]
}

/**
 * SupplierWithUsers extends a Supplier with its services, locations, and users.
 */
export interface SupplierWithUsers extends SupplierWithDetail {
  users: SupplierUser[]
}

/**
 * Tile extends the tile table with its suppliers and if the tile is saved by the current user.
 */
export interface Tile extends TileRaw {
  suppliers: Supplier[]
  isSaved?: boolean
}
