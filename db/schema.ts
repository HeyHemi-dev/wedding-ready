import { pgTable, text, uuid, timestamp, boolean, primaryKey, pgSchema } from 'drizzle-orm/pg-core'

const authSchema = pgSchema('auth')

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
  ownedByUserId: uuid('owned_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  handle: text('handle').notNull().unique(),
  handleUpdatedAt: timestamp('handle_updated_at').notNull().defaultNow(),
  description: text('description'),
  websiteUrl: text('website_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const tiles = pgTable('tiles', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  imagePath: text('image_path').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  createdByUserId: uuid('created_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'no action' }),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'set null' }),
  isPrivate: boolean('is_private').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

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
  },
  (table) => [primaryKey({ columns: [table.tileId, table.supplierId] })]
)

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

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: text('name').notNull(),
  locationType: text('location_type').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const supplierLocations = pgTable(
  'supplier_locations',
  {
    supplierId: uuid('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.supplierId, table.locationId] })]
)
