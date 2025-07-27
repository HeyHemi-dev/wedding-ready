import { eq, and, inArray, isNotNull, desc } from 'drizzle-orm'

import { db } from '@/db/connection'
import * as s from '@/db/schema'

import type * as t from '@/models/types'
import { Service } from '@/db/constants'
import { SavedTilesModel } from '@/models/savedTiles'

export const TileModel = {
  getRawById,
  getById,
  getBySupplierId,
  getByUserId,
  createRaw,
  updateRaw,
  // addSuppliers,
  // addSupplierCredit,
  // getCredits,
  // getSavedStateRaw,
  // updateSaveStateRaw,
}

async function getRawById(id: string): Promise<t.TileRaw | null> {
  const tiles = await db.select().from(s.tiles).where(eq(s.tiles.id, id))

  if (tiles === null || tiles.length === 0) return null

  return tiles[0]
}

async function getById(id: string, authUserId?: string): Promise<t.Tile | null> {
  // Since we're filtering for non-null imagePath in the query, we can safely cast the type
  const tiles = (await db
    .select()
    .from(s.tiles)
    .where(and(eq(s.tiles.id, id), isNotNull(s.tiles.imagePath)))) as t.TileRawWithImage[]

  if (tiles === null || tiles.length === 0) return null

  if (authUserId) {
    await getSavedState(tiles, authUserId)
  }

  return tiles[0]
}

async function getBySupplierId(supplierId: string, authUserId?: string): Promise<t.Tile[]> {
  // Since we're filtering for non-null imagePath in the query, we can safely cast the type
  const tiles = (await db
    .select({
      ...s.tileColumns,
    })
    .from(s.tiles)
    .innerJoin(s.tileSuppliers, eq(s.tileSuppliers.tileId, s.tiles.id))
    .where(and(eq(s.tileSuppliers.supplierId, supplierId), eq(s.tiles.isPrivate, false), isNotNull(s.tiles.imagePath)))
    .orderBy(desc(s.tiles.createdAt))) as t.TileRawWithImage[]

  // Get the user's saved status for each tile
  if (authUserId) {
    await getSavedState(tiles, authUserId)
  }

  return tiles
}

async function getByUserId(userId: string, authUserId?: string): Promise<t.Tile[]> {
  // Get all the tiles saved by a user.
  // Since we filter for non-null imagePath in the DB query, we can safely cast the type
  const tiles = (await db
    .select({
      ...s.tileColumns,
    })
    .from(s.tiles)
    .innerJoin(s.savedTiles, eq(s.tiles.id, s.savedTiles.tileId))
    .where(and(eq(s.savedTiles.userId, userId), isNotNull(s.tiles.imagePath), eq(s.savedTiles.isSaved, true)))
    .orderBy(desc(s.tiles.createdAt))) as t.TileRawWithImage[]

  // Get the current auth user's saved status for each tile
  // Note: the authUser can be different from the user we're getting tiles for.
  if (authUserId) {
    await getSavedState(tiles, authUserId)
  }

  return tiles
}

/**
 * Create a tile
 */
async function createRaw(tileRawData: t.InsertTileRaw): Promise<t.TileRaw> {
  const tilesRaw = await db.insert(s.tiles).values(tileRawData).returning()
  return tilesRaw[0]
}

/**
 * Update a tile and its relationships with suppliers
 * @param tileRawData - overwrites the existing tile data
 * @param suppliersRaw - optional. If passed it will overwrite the existing tileSupplier relationships. Will not update the suppliers themselves.
 * @requires tileRawData.imagePath - The path to the tile image
 * @returns The updated tile
 */
async function updateRaw(tileRawData: t.TileRaw): Promise<t.TileRawWithImage> {
  if (!tileRawData.imagePath) {
    throw new Error('imagePath is required')
  }

  const tilesRaw = await db.update(s.tiles).set(tileUpdateSafe(tileRawData)).where(eq(s.tiles.id, tileRawData.id)).returning()
  const tileRaw = tilesRaw[0]

  return {
    ...tileRaw,
    imagePath: tileRaw.imagePath!, // We can assert that imagePath exists because we already threw an error if it was missing.
  }
}

// async function addSuppliers(tileId: string, supplierIds: string[]): Promise<t.TileSupplierRaw[]> {
//   const tileSuppliers = await db.insert(s.tileSuppliers).values(
//     supplierIds.map((supplierId) => ({
//       tileId,
//       supplierId,
//     }))
//   )
//   return tileSuppliers
// }

// async function addSupplierCredit(
//   tileId: string,
//   credit: {
//     supplierId: string
//     service?: Service
//     serviceDescription?: string
//   }
// ): Promise<t.TileSupplierRaw> {
//   const result = await db
//     .insert(s.tileSuppliers)
//     .values({
//       tileId,
//       supplierId: credit.supplierId,
//       service: credit.service,
//       serviceDescription: credit.serviceDescription,
//     })
//     .returning()

//   return result[0]
// }

// async function getCredits(tileId: string): Promise<t.TileCredit[]> {
//   const rows = await db
//     .select({
//       ...s.tileSupplierColumns,
//       supplier: s.suppliers,
//     })
//     .from(s.tileSuppliers)
//     .innerJoin(s.suppliers, eq(s.tileSuppliers.supplierId, s.suppliers.id))
//     .where(eq(s.tileSuppliers.tileId, tileId))

//   return rows.map((row) => ({
//     ...row,
//     supplier: row.supplier,
//   }))
// }

// async function getSavedStateRaw(tileId: string, userId: string): Promise<t.SavedTileRaw | null> {
//   const savedTiles = await db
//     .select()
//     .from(s.savedTiles)
//     .where(and(eq(s.savedTiles.tileId, tileId), eq(s.savedTiles.userId, userId)))
//     .limit(1)

//   return savedTiles.length ? savedTiles[0] : null
// }

// /**
//  * lets a user save/unsave a tile by upserting the saved tile relationship.
//  * @returns The updated saved status of the tile
//  */
// async function updateSaveStateRaw(savedTileData: t.InsertSavedTileRaw): Promise<t.SavedTileRaw> {
//   const savedTiles = await db
//     .insert(s.savedTiles)
//     .values(savedTileData)
//     .onConflictDoUpdate({
//       target: [s.savedTiles.tileId, s.savedTiles.userId],
//       set: {
//         isSaved: savedTileData.isSaved,
//       },
//     })
//     .returning()

//   return savedTiles[0]
// }

// async function getSavedTilesRaw(tiles: t.TileRaw[] | t.Tile[], userId: string): Promise<t.SavedTileRaw[]> {
//   const savedTiles = await db
//     .select()
//     .from(s.savedTiles)
//     .where(
//       and(
//         eq(s.savedTiles.userId, userId),
//         inArray(
//           s.savedTiles.tileId,
//           tiles.map((t) => t.id)
//         )
//       )
//     )
//   return savedTiles
// }

/**
 * Removes fields that should not be updated from a TileRaw
 * @returns A safe update object with the updatedAt field set to the current date
 */
function tileUpdateSafe(tile: t.TileRaw | t.Tile): t.SetTileRaw {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, createdByUserId, updatedAt, isPrivate, ...rest } = tile
  return {
    ...rest,
    updatedAt: new Date(),
  }
}

async function getSavedState(tiles: t.TileRaw[], authUserId: string) {
  const savedTiles = await SavedTilesModel.getSavedTilesRaw(
    tiles.map((t) => t.id),
    authUserId
  )

  return tiles.map((tile) => ({
    ...tile,
    isSaved: savedTiles.find((st) => st.tileId === tile.id)?.isSaved ?? false,
  }))
}
