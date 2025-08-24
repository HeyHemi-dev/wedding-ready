import { eq, and, isNotNull, desc, inArray } from 'drizzle-orm'

import { db } from '@/db/connection'
import * as s from '@/db/schema'
import type * as t from '@/models/types'

export const tileModel = {
  getRawById,
  getById,
  getManyBySupplierId,
  getManyRawBySupplierHandle,
  getManyByUserId,
  createRaw,
  updateRaw,
  deleteById,
  deleteManyByIds,
}

async function getRawById(id: string): Promise<t.TileRaw | null> {
  const tiles = await db.select().from(s.tiles).where(eq(s.tiles.id, id))

  if (tiles === null || tiles.length === 0) return null

  return tiles[0]
}

async function getById(id: string): Promise<t.TileRawWithImage | null> {
  // Since we're filtering for non-null imagePath in the query, we can safely cast the type
  const tiles = (await db
    .select()
    .from(s.tiles)
    .where(and(eq(s.tiles.id, id), isNotNull(s.tiles.imagePath)))) as t.TileRawWithImage[]

  if (tiles === null || tiles.length === 0) return null

  return tiles[0]
}

async function getManyBySupplierId(supplierId: string): Promise<t.TileRawWithImage[]> {
  // Since we're filtering for non-null imagePath in the query, we can safely cast the type
  const tiles = (await db
    .select(s.tileColumns)
    .from(s.tiles)
    .innerJoin(s.tileSuppliers, eq(s.tileSuppliers.tileId, s.tiles.id))
    .where(and(eq(s.tileSuppliers.supplierId, supplierId), eq(s.tiles.isPrivate, false), isNotNull(s.tiles.imagePath)))
    .orderBy(desc(s.tiles.createdAt))) as t.TileRawWithImage[]

  return tiles
}

async function getManyRawBySupplierHandle(supplierHandle: string): Promise<t.TileRaw[]> {
  const tiles = await db
    .select(s.tileColumns)
    .from(s.tiles)
    .innerJoin(s.tileSuppliers, eq(s.tiles.id, s.tileSuppliers.tileId))
    .innerJoin(s.suppliers, eq(s.tileSuppliers.supplierId, s.suppliers.id))
    .where(and(eq(s.suppliers.handle, supplierHandle)))
  return tiles
}

async function getManyByUserId(userId: string): Promise<t.TileRawWithImage[]> {
  // Since we filter for non-null imagePath in the DB query, we can safely cast the type
  const tiles = (await db
    .select(s.tileColumns)
    .from(s.tiles)
    .innerJoin(s.savedTiles, eq(s.tiles.id, s.savedTiles.tileId))
    .where(and(eq(s.savedTiles.userId, userId), isNotNull(s.tiles.imagePath), eq(s.savedTiles.isSaved, true)))
    .orderBy(desc(s.tiles.createdAt))) as t.TileRawWithImage[]

  return tiles
}

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

async function deleteById(id: string): Promise<void> {
  await db.delete(s.tiles).where(eq(s.tiles.id, id))
}

async function deleteManyByIds(ids: string[]): Promise<void> {
  await db.delete(s.tiles).where(inArray(s.tiles.id, ids))
}
