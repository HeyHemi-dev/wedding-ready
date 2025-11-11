import { InferSelectModel, InferInsertModel } from 'drizzle-orm'

import * as schema from '@/db/schema'

/**
 * UserProfileRaw represents a single row in the user_profiles table and is used to extend the Supabase Auth user with additional fields.
 */
export type UserProfileRaw = InferSelectModel<typeof schema.userProfiles>
export type InsertUserProfileRaw = InferInsertModel<typeof schema.userProfiles>
export type SetUserProfileRaw = Partial<Omit<InsertUserProfileRaw, 'id' | 'createdAt'>>

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

export interface TileCredit extends TileSupplierRaw {
  supplier: SupplierRaw
}
