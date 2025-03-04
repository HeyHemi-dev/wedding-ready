import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { suppliers, supplierLocations, tileSuppliers } from '@/db/schema'

export type Supplier = InferSelectModel<typeof suppliers>
export type InsertSupplier = InferInsertModel<typeof suppliers>

export type SupplierLocation = InferSelectModel<typeof supplierLocations>
export type InsertSupplierLocation = InferInsertModel<typeof supplierLocations>
