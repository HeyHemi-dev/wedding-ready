import { relations } from 'drizzle-orm/relations'
import {
  usersInAuth,
  tiles,
  userDetails,
  stacks,
  suppliers,
  supplierServices,
  stackTiles,
  supplierLocations,
  savedTiles,
  tileSuppliers,
  supplierUsers,
} from './schema'

export const tilesRelations = relations(tiles, ({ one, many }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [tiles.createdByUserId],
    references: [usersInAuth.id],
  }),
  stackTiles: many(stackTiles),
  savedTiles: many(savedTiles),
  tileSuppliers: many(tileSuppliers),
}))

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  tiles: many(tiles),
  userDetails: many(userDetails),
  stacks: many(stacks),
  suppliers: many(suppliers),
  savedTiles: many(savedTiles),
  supplierUsers: many(supplierUsers),
}))

export const userDetailsRelations = relations(userDetails, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [userDetails.id],
    references: [usersInAuth.id],
  }),
}))

export const stacksRelations = relations(stacks, ({ one, many }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [stacks.ownedByUserId],
    references: [usersInAuth.id],
  }),
  stackTiles: many(stackTiles),
}))

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [suppliers.createdByUserId],
    references: [usersInAuth.id],
  }),
  supplierServices: many(supplierServices),
  supplierLocations: many(supplierLocations),
  tileSuppliers: many(tileSuppliers),
  supplierUsers: many(supplierUsers),
}))

export const supplierServicesRelations = relations(supplierServices, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierServices.supplierId],
    references: [suppliers.id],
  }),
}))

export const stackTilesRelations = relations(stackTiles, ({ one }) => ({
  stack: one(stacks, {
    fields: [stackTiles.stackId],
    references: [stacks.id],
  }),
  tile: one(tiles, {
    fields: [stackTiles.tileId],
    references: [tiles.id],
  }),
}))

export const supplierLocationsRelations = relations(supplierLocations, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierLocations.supplierId],
    references: [suppliers.id],
  }),
}))

export const savedTilesRelations = relations(savedTiles, ({ one }) => ({
  tile: one(tiles, {
    fields: [savedTiles.tileId],
    references: [tiles.id],
  }),
  usersInAuth: one(usersInAuth, {
    fields: [savedTiles.userId],
    references: [usersInAuth.id],
  }),
}))

export const tileSuppliersRelations = relations(tileSuppliers, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [tileSuppliers.supplierId],
    references: [suppliers.id],
  }),
  tile: one(tiles, {
    fields: [tileSuppliers.tileId],
    references: [tiles.id],
  }),
}))

export const supplierUsersRelations = relations(supplierUsers, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierUsers.supplierId],
    references: [suppliers.id],
  }),
  usersInAuth: one(usersInAuth, {
    fields: [supplierUsers.userId],
    references: [usersInAuth.id],
  }),
}))
