import { InferSelectModel, InferInsertModel, getTableColumns } from 'drizzle-orm'
import { suppliers, supplierLocations, supplierUsers, supplierServices } from '@/db/schema'
import { Location } from '@/models/locations'

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

// This enum is used by the schema to define the pgEnum
export enum SupplierRole {
  ADMIN = 'admin',
  STANDARD = 'standard',
}

// Wedding supplier services
export enum Service {
  // Place & food
  VENUE = 'venue',
  ACCOMODATION = 'accomodation',
  CATERER = 'caterer',
  CAKE = 'cake',
  // Capture
  PHOTOGRAPHER = 'photographer',
  VIDEOGRAPHER = 'videographer',
  // Outfit
  BRIDAL_WEAR = 'bridal_wear',
  BRIDESMAIDS_WEAR = 'bridesmaids_wear',
  BRIDAL_ACCESSORY = 'bridal_accessory',
  MENSWEAR = 'menswear',
  MENSWEAR_ACCESSORY = 'menswear_accessory',
  RINGS = 'rings',
  // Beauty
  MAKEUP = 'makeup',
  HAIR = 'hair',
  BEAUTY = 'beauty',
  // Organise
  PLANNER = 'planner',
  CELEBRANT = 'celebrant',
  MC = 'mc',
  // Style
  FLORIST = 'florist',
  STYLIST = 'stylist',
  HIRE = 'hire',
  STATIONERY = 'stationery',
  // Vibes
  BAND = 'band',
  ENTERTAINMENT = 'entertainment',
  // Logistics
  TRANSPORT = 'transport',
  SUPPORT = 'support',
}
