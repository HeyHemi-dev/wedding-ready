import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import * as schema from '@/db/schema'
import { Service, Location } from '@/models/constants'
import { User as UserRaw } from '@supabase/supabase-js'

export type AuthUser = UserRaw

/**
 * A UserDetail (no 's') represents a single row in the user_details table and is used to extend the Supabase Auth user with additional fields.
 */
export type UserDetailRaw = InferSelectModel<typeof schema.user_details>

/**
 * UserDetail is used to extend the Supabase Auth user with additional fields.
 * @requires id - must match the id of the Supabase Auth user
 */
export type InsertUserDetailRaw = InferInsertModel<typeof schema.user_details>
export type SetUserDetailRaw = Partial<Omit<InsertUserDetailRaw, 'id' | 'createdAt'>>

export type SupplierRaw = InferSelectModel<typeof schema.suppliers>
export type InsertSupplierRaw = InferInsertModel<typeof schema.suppliers>
export type SetSupplierRaw = Partial<Omit<InsertSupplierRaw, 'id' | 'createdAt' | 'createdByUserId'>>

export type TileRaw = InferSelectModel<typeof schema.tiles>
export type InsertTileRaw = InferInsertModel<typeof schema.tiles>
export type SetTileRaw = Partial<Omit<InsertTileRaw, 'id' | 'createdAt' | 'createdByUserId' | 'isPrivate'>>

export type StackRaw = InferSelectModel<typeof schema.stacks>
export type InsertStackRaw = InferInsertModel<typeof schema.stacks>
export type SetStackRaw = Partial<Omit<InsertStackRaw, 'id' | 'createdAt' | 'ownedByUserId'>>

export type SupplierUserRaw = InferSelectModel<typeof schema.supplierUsers>
export type InsertSupplierUserRaw = InferInsertModel<typeof schema.supplierUsers>
export type SetSupplierUserRaw = Partial<Omit<InsertSupplierUserRaw, 'supplierId' | 'userId'>>

export type SupplierServiceRaw = InferSelectModel<typeof schema.supplierServices>
export type InsertSupplierServiceRaw = InferInsertModel<typeof schema.supplierServices>
export type SetSupplierServiceRaw = Partial<Omit<InsertSupplierServiceRaw, 'supplierId' | 'service'>>

export type SupplierLocationRaw = InferSelectModel<typeof schema.supplierLocations>
export type InsertSupplierLocationRaw = InferInsertModel<typeof schema.supplierLocations>
export type SetSupplierLocationRaw = Partial<Omit<InsertSupplierLocationRaw, 'supplierId' | 'location'>>

export type SavedTileRaw = InferSelectModel<typeof schema.savedTiles>
export type InsertSavedTileRaw = InferInsertModel<typeof schema.savedTiles>
export type SetSavedTileRaw = Partial<Omit<InsertSavedTileRaw, 'userId' | 'tileId'>>

export type TileSupplierRaw = InferSelectModel<typeof schema.tileSuppliers>
export type InsertTileSupplierRaw = InferInsertModel<typeof schema.tileSuppliers>
export type SetTileSupplierRaw = Partial<Omit<InsertTileSupplierRaw, 'tileId' | 'supplierId'>>

export type StackTileRaw = InferSelectModel<typeof schema.stackTiles>
export type InsertStackTileRaw = InferInsertModel<typeof schema.stackTiles>
export type SetStackTileRaw = Partial<Omit<InsertStackTileRaw, 'stackId' | 'tileId'>>

/**
 * UserWithDetail extends Supabase Auth user with user_details fields.
 */
export interface User extends AuthUser {
  extended: UserDetailRaw
}

/**
 * Combines a Supabase Auth user and UserDetail.
 */
export function makeUserWithDetail(user: AuthUser, userDetail: UserDetailRaw): User {
  return {
    ...user,
    extended: userDetail,
  } as User
}

/**
 * SupplierWithDetail extends a Supplier with its services and locations.
 */
export interface Supplier extends SupplierRaw {
  services: Service[]
  locations: Location[]
}

/**
 * SupplierWithUsers extends a Supplier with its services, locations, and users.
 */
export interface SupplierWithUsers extends Supplier {
  users: SupplierUserRaw[]
}

/**
 * TileRawWithSuppliers extends a Tile with its suppliers.
 * The ImagePath is not required which makes this type useful when creating a tile before the image is uploaded to storage.
 */
export interface TileRawWithSuppliers extends TileRaw {
  suppliers: SupplierRaw[]
}

/**
 * Tile extends tile table row with a required imagePath, its suppliers and optionally if the tile is saved by the current user.
 * @requires imagePath - Since we allow a raw tile to be created before the image is uploaded, we require the imagePath to be set here to  ensure we have a valid tile object.
 * @requires suppliers - List of suppliers that are associated with the tile.
 */
export interface Tile extends TileRaw {
  imagePath: string
  suppliers: SupplierRaw[]
  isSaved?: boolean
}
