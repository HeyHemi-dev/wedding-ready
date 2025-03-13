import { Service, SupplierRole, Location } from '@/models/constants'
import { enumToPgEnum } from '@/utils/enum-to-pgEnum'
import { pgTable, text, uuid, timestamp, boolean, primaryKey, pgSchema, pgEnum } from 'drizzle-orm/pg-core'

const authSchema = pgSchema('auth')

export const supplierRoles = pgEnum('supplier_roles', enumToPgEnum(SupplierRole))

export const services = pgEnum('services', enumToPgEnum(Service))

export const locations = pgEnum('locations', enumToPgEnum(Location))

const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
})

// Maintain 1-1 relationship between users and auth users
export const user_details = pgTable('user_details', {
  id: uuid('id')
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  handle: text('handle').notNull().unique(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

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

export const tiles = pgTable('tiles', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  imagePath: text('image_path').unique(),
  title: text('title').notNull(),
  description: text('description'),
  createdByUserId: uuid('created_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'no action' }),
  location: locations('location'),
  isPrivate: boolean('is_private').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

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

export const supplierUsers = pgTable(
  'supplier_users',
  {
    supplierId: uuid('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: supplierRoles('role').notNull().default(SupplierRole.STANDARD),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.supplierId, table.userId] })]
)

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
  (table) => [primaryKey({ columns: [table.userId, table.tileId] })]
)

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
