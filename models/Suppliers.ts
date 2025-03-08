import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { suppliers, supplierLocations, supplierUsers } from '@/db/schema'

export type Supplier = InferSelectModel<typeof suppliers>
export type InsertSupplier = InferInsertModel<typeof suppliers>

export type SupplierLocation = InferSelectModel<typeof supplierLocations>
export type InsertSupplierLocation = InferInsertModel<typeof supplierLocations>

export type SupplierUser = InferSelectModel<typeof supplierUsers>
export type InsertSupplierUser = InferInsertModel<typeof supplierUsers>

export interface SupplierWithUsers extends Supplier {
  users: SupplierUser[]
}

// This enum is used by the schema to define the pgEnum
export enum SupplierRole {
  ADMIN = 'admin',
  STANDARD = 'standard',
}
