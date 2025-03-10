import { InferSelectModel, InferInsertModel, getTableColumns } from 'drizzle-orm'
import { suppliers, supplierLocations, supplierUsers, supplierServices } from '@/db/schema'
import { Location } from '@/models/locations'
import { Service, SupplierRole } from '@/models/constants'

export type Supplier = InferSelectModel<typeof suppliers>
export type InsertSupplier = InferInsertModel<typeof suppliers>
export const supplierColumns = getTableColumns(suppliers)

export type SupplierLocation = InferSelectModel<typeof supplierLocations>
export type InsertSupplierLocation = InferInsertModel<typeof supplierLocations>
export const supplierLocationColumns = getTableColumns(supplierLocations)

export type SupplierService = InferSelectModel<typeof supplierServices>
export type InsertSupplierService = InferInsertModel<typeof supplierServices>
export const supplierServiceColumns = getTableColumns(supplierServices)

export type SupplierUser = InferSelectModel<typeof supplierUsers>
export type InsertSupplierUser = InferInsertModel<typeof supplierUsers>
export const supplierUserColumns = getTableColumns(supplierUsers)

export interface SupplierWithDetail extends Supplier {
  services: Service[]
  locations: Location[]
}

export interface SupplierWithUsers extends SupplierWithDetail {
  users: SupplierUser[]
}
