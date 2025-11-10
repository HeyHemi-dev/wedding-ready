import { eq, and, desc, inArray } from 'drizzle-orm'

import { db } from '@/db/connection'
import * as s from '@/db/schema'
import type * as t from '@/models/types'

export const tileModel = {
  getRawById,
  getManyRawBySupplierId,
  getManyRawBySupplierHandle,
  getManyRawByUserId,
  createRaw,
  updateRaw,
  deleteById,
  deleteManyByIds,
}

async function getRawById(id: string): Promise<t.TileRaw | null> {
  const tilesRaw = await db.select().from(s.tiles).where(eq(s.tiles.id, id))
  if (tilesRaw.length === 0) return null
  return tilesRaw[0]
}

type GetManyRawBySupplierIdOptions = {
  limit?: number
  offset?: number
}
async function getManyRawBySupplierId(supplierId: string, { limit, offset = 0 }: GetManyRawBySupplierIdOptions = {}): Promise<t.TileRaw[]> {
  const tilesQuery = db
    .select(s.tileColumns)
    .from(s.tiles)
    .innerJoin(s.tileSuppliers, eq(s.tileSuppliers.tileId, s.tiles.id))
    .where(and(eq(s.tileSuppliers.supplierId, supplierId), eq(s.tiles.isPrivate, false)))
    .orderBy(desc(s.tiles.createdAt))

  if (limit) {
    return await tilesQuery.limit(limit).offset(offset)
  }
  return await tilesQuery
}

async function getManyRawBySupplierHandle(supplierHandle: string): Promise<t.TileRaw[]> {
  return await db
    .select(s.tileColumns)
    .from(s.tiles)
    .innerJoin(s.tileSuppliers, eq(s.tiles.id, s.tileSuppliers.tileId))
    .innerJoin(s.suppliers, eq(s.tileSuppliers.supplierId, s.suppliers.id))
    .where(and(eq(s.suppliers.handle, supplierHandle)))
    .orderBy(desc(s.tiles.createdAt))
}

async function getManyRawByUserId(userId: string): Promise<t.TileRaw[]> {
  return await db
    .select(s.tileColumns)
    .from(s.tiles)
    .innerJoin(s.savedTiles, eq(s.tiles.id, s.savedTiles.tileId))
    .where(and(eq(s.savedTiles.userId, userId), eq(s.savedTiles.isSaved, true)))
    .orderBy(desc(s.tiles.createdAt))
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
async function updateRaw(id: string, tileRawData: t.SetTileRaw): Promise<t.TileRaw> {
  tileRawData.updatedAt = new Date()
  const tilesRaw = await db.update(s.tiles).set(tileRawData).where(eq(s.tiles.id, id)).returning()
  return tilesRaw[0]
}

async function deleteById(id: string): Promise<void> {
  await db.delete(s.tiles).where(eq(s.tiles.id, id))
}

async function deleteManyByIds(ids: string[]): Promise<void> {
  await db.delete(s.tiles).where(inArray(s.tiles.id, ids))
}
