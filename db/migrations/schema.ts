import { pgTable, foreignKey, unique, uuid, text, timestamp, boolean, primaryKey, pgEnum } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

import { authUsers as users } from 'drizzle-orm/supabase'
export const usersInAuth = users

export const locations = pgEnum('locations', [
  'northland',
  'auckland',
  'waikato',
  'bay_of_plenty',
  'gisborne',
  'hawkes_bay',
  'taranakai',
  'manawatu_whanganui',
  'wellington',
  'nelson_tasman',
  'marlborough',
  'west_coast',
  'canterbury',
  'otago',
  'southland',
])
export const services = pgEnum('services', [
  'venue',
  'accomodation',
  'caterer',
  'cake',
  'photographer',
  'videographer',
  'bridal_wear',
  'bridesmaids_wear',
  'bridal_accessory',
  'menswear',
  'menswear_accessory',
  'rings',
  'makeup',
  'hair',
  'beauty',
  'planner',
  'celebrant',
  'mc',
  'florist',
  'stylist',
  'hire',
  'stationery',
  'band',
  'entertainment',
  'transport',
  'support',
])
export const supplierRoles = pgEnum('supplier_roles', ['admin', 'standard'])

export const tiles = pgTable(
  'tiles',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    imagePath: text('image_path'),
    title: text().notNull(),
    description: text(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    createdByUserId: uuid('created_by_user_id').notNull(),
    isPrivate: boolean('is_private').default(false).notNull(),
    location: locations(),
  },
  (table) => [
    foreignKey({
      columns: [table.createdByUserId],
      foreignColumns: [users.id],
      name: 'tiles_created_by_user_id_users_id_fk',
    }),
    unique('tiles_image_path_unique').on(table.imagePath),
  ]
)

export const userDetails = pgTable(
  'user_details',
  {
    id: uuid().primaryKey().notNull(),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    handle: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: 'user_details_id_users_id_fk',
    }).onDelete('cascade'),
    unique('user_details_handle_unique').on(table.handle),
  ]
)

export const stacks = pgTable(
  'stacks',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    ownedByUserId: uuid('owned_by_user_id').notNull(),
    title: text().notNull(),
    description: text(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ownedByUserId],
      foreignColumns: [users.id],
      name: 'stacks_owned_by_user_id_users_id_fk',
    }).onDelete('cascade'),
  ]
)

export const suppliers = pgTable(
  'suppliers',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdByUserId: uuid('created_by_user_id').notNull(),
    name: text().notNull(),
    description: text(),
    websiteUrl: text('website_url'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    handle: text().notNull(),
    handleUpdatedAt: timestamp('handle_updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.createdByUserId],
      foreignColumns: [users.id],
      name: 'suppliers_created_by_user_id_users_id_fk',
    }),
    unique('suppliers_handle_unique').on(table.handle),
  ]
)

export const supplierServices = pgTable(
  'supplier_services',
  {
    supplierId: uuid('supplier_id').notNull(),
    service: services().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.supplierId],
      foreignColumns: [suppliers.id],
      name: 'supplier_services_supplier_id_suppliers_id_fk',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.supplierId, table.service],
      name: 'supplier_services_supplier_id_service_pk',
    }),
  ]
)

export const stackTiles = pgTable(
  'stack_tiles',
  {
    stackId: uuid('stack_id').notNull(),
    tileId: uuid('tile_id').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.stackId],
      foreignColumns: [stacks.id],
      name: 'stack_tiles_stack_id_stacks_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.tileId],
      foreignColumns: [tiles.id],
      name: 'stack_tiles_tile_id_tiles_id_fk',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.stackId, table.tileId],
      name: 'stack_tiles_stack_id_tile_id_pk',
    }),
  ]
)

export const supplierLocations = pgTable(
  'supplier_locations',
  {
    supplierId: uuid('supplier_id').notNull(),
    location: locations().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.supplierId],
      foreignColumns: [suppliers.id],
      name: 'supplier_locations_supplier_id_suppliers_id_fk',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.supplierId, table.location],
      name: 'supplier_locations_supplier_id_location_pk',
    }),
  ]
)

export const savedTiles = pgTable(
  'saved_tiles',
  {
    userId: uuid('user_id').notNull(),
    tileId: uuid('tile_id').notNull(),
    isSaved: boolean('is_saved').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.tileId],
      foreignColumns: [tiles.id],
      name: 'saved_tiles_tile_id_tiles_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'saved_tiles_user_id_users_id_fk',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.userId, table.tileId],
      name: 'saved_tiles_user_id_tile_id_pk',
    }),
  ]
)

export const tileSuppliers = pgTable(
  'tile_suppliers',
  {
    tileId: uuid('tile_id').notNull(),
    supplierId: uuid('supplier_id').notNull(),
    service: services(),
    serviceDescription: text('service_description'),
  },
  (table) => [
    foreignKey({
      columns: [table.supplierId],
      foreignColumns: [suppliers.id],
      name: 'tile_suppliers_supplier_id_suppliers_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.tileId],
      foreignColumns: [tiles.id],
      name: 'tile_suppliers_tile_id_tiles_id_fk',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.tileId, table.supplierId],
      name: 'tile_suppliers_tile_id_supplier_id_pk',
    }),
  ]
)

export const supplierUsers = pgTable(
  'supplier_users',
  {
    supplierId: uuid('supplier_id').notNull(),
    userId: uuid('user_id').notNull(),
    role: supplierRoles().default('standard').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.supplierId],
      foreignColumns: [suppliers.id],
      name: 'supplier_users_supplier_id_suppliers_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'supplier_users_user_id_users_id_fk',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.supplierId, table.userId],
      name: 'supplier_users_supplier_id_user_id_pk',
    }),
  ]
)
