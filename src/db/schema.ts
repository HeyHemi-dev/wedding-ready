import { getTableColumns } from 'drizzle-orm'
import { pgTable, text, uuid, timestamp, boolean, primaryKey, pgEnum, index, real } from 'drizzle-orm/pg-core'
import { authUsers as users } from 'drizzle-orm/supabase'

import { SERVICES, SUPPLIER_ROLES, LOCATIONS } from '@/db/constants'
import { constToPgEnum } from '@/utils/const-helpers'

export const supplierRoles = pgEnum('supplier_roles', constToPgEnum(SUPPLIER_ROLES))

export const services = pgEnum('services', constToPgEnum(SERVICES))

export const locations = pgEnum('locations', constToPgEnum(LOCATIONS))

// Maintain 1-1 relationship between user_details and auth.users
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id')
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  handle: text('handle').notNull().unique(),
  handleUpdatedAt: timestamp('handle_updated_at').notNull().defaultNow(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  instagramUrl: text('instagram_url'),
  tiktokUrl: text('tiktok_url'),
  websiteUrl: text('website_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export const userProfileColumns = getTableColumns(userProfiles)

export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: text('name').notNull(),
  handle: text('handle').notNull().unique(),
  handleUpdatedAt: timestamp('handle_updated_at').notNull().defaultNow(),
  description: text('description'),
  websiteUrl: text('website_url'),
  createdByUserId: uuid('created_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'no action' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export const supplierColumns = getTableColumns(suppliers)

export const tiles = pgTable('tiles', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  imagePath: text('image_path').unique().notNull(),
  title: text('title'),
  description: text('description'),
  createdByUserId: uuid('created_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'no action' }),
  location: locations('location'),
  isPrivate: boolean('is_private').notNull().default(false),
  score: real('score').notNull().default(1),
  scoreUpdatedAt: timestamp('score_updated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export const tileColumns = getTableColumns(tiles)

export const stacks = pgTable('stacks', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  ownedByUserId: uuid('owned_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export const stackColumns = getTableColumns(stacks)

export const supplierUsers = pgTable(
  'supplier_users',
  {
    supplierId: uuid('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: supplierRoles('role').notNull().default(SUPPLIER_ROLES.STANDARD),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.supplierId, table.userId] })]
)
export const supplierUserColumns = getTableColumns(supplierUsers)

export const supplierServices = pgTable(
  'supplier_services',
  {
    supplierId: uuid('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' }),
    service: services('service').notNull(),
  },
  (table) => [primaryKey({ columns: [table.supplierId, table.service] })]
)
export const supplierServiceColumns = getTableColumns(supplierServices)

export const supplierLocations = pgTable(
  'supplier_locations',
  {
    supplierId: uuid('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' }),
    location: locations('location').notNull(),
  },
  (table) => [primaryKey({ columns: [table.supplierId, table.location] })]
)
export const supplierLocationColumns = getTableColumns(supplierLocations)

export const savedTiles = pgTable(
  'saved_tiles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tileId: uuid('tile_id')
      .notNull()
      .references(() => tiles.id, { onDelete: 'cascade' }),
    isSaved: boolean('is_saved').notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.tileId] }), index('saved_tiles_user_is_saved_idx').on(table.userId, table.isSaved)]
)
export const savedTileColumns = getTableColumns(savedTiles)

// Keep track of tiles that have been showed to the user in their feed
export const viewedTiles = pgTable(
  'viewed_tiles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tileId: uuid('tile_id')
      .notNull()
      .references(() => tiles.id, { onDelete: 'cascade' }),
    viewedAt: timestamp('viewed_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.tileId] }), index('viewed_tiles_user_viewed_at_idx').on(table.userId, table.viewedAt.desc())]
)
export const viewedTileColumns = getTableColumns(viewedTiles)

export const tileSuppliers = pgTable(
  'tile_suppliers',
  {
    tileId: uuid('tile_id')
      .notNull()
      .references(() => tiles.id, { onDelete: 'cascade' }),
    supplierId: uuid('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' }),
    service: services('service'),
    serviceDescription: text('service_description'),
  },
  (table) => [primaryKey({ columns: [table.tileId, table.supplierId] })]
)
export const tileSupplierColumns = getTableColumns(tileSuppliers)

export const stackTiles = pgTable(
  'stack_tiles',
  {
    stackId: uuid('stack_id')
      .notNull()
      .references(() => stacks.id, { onDelete: 'cascade' }),
    tileId: uuid('tile_id')
      .notNull()
      .references(() => tiles.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.stackId, table.tileId] })]
)
export const stackTileColumns = getTableColumns(stackTiles)
