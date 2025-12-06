import { eq, and, desc, inArray, not, lt, gte, isNull } from 'drizzle-orm'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { db } from '@/db/connection'
import * as s from '@/db/schema'
import type * as t from '@/models/types'
import { emptyStringToNull } from '@/utils/empty-strings'

export const tileModel = {
  getRawById,
  getManyForFeed,
  getManyRawBySupplierId,
  getManyRawBySupplierHandle,
  getManyRawByUserId,

  createRaw,
  updateRaw,
  updateScore,
  deleteById,
  deleteManyByIds,
}

async function getRawById(id: string): Promise<t.TileRaw | null> {
  const tilesRaw = await db.select().from(s.tiles).where(eq(s.tiles.id, id))
  if (tilesRaw.length === 0) return null
  return tilesRaw[0]
}

type GetManyRawOptions = {
  limit: number
}
/**
 * Get public tiles, that have not been viewed by the user in the last 7 days, and are not saved by the user, sorted by score.
 * @param authUserId
 * @param {limit} limit - The maximum number of tiles to return.
 * @returns
 */
async function getManyForFeed(authUserId: string, { limit }: GetManyRawOptions): Promise<t.TileRaw[]> {
  const sevenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
  return db
    .select(s.tileColumns)
    .from(s.tiles)
    .leftJoin(s.viewedTiles, and(eq(s.viewedTiles.tileId, s.tiles.id), eq(s.viewedTiles.userId, authUserId), gte(s.viewedTiles.viewedAt, sevenDaysAgo)))
    .leftJoin(s.savedTiles, and(eq(s.savedTiles.tileId, s.tiles.id), eq(s.savedTiles.userId, authUserId), eq(s.savedTiles.isSaved, true)))
    .where(and(eq(s.tiles.isPrivate, false), isNull(s.viewedTiles.tileId), isNull(s.savedTiles.tileId)))
    .orderBy(desc(s.tiles.score))
    .limit(limit)
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
  return db
    .select(s.tileColumns)
    .from(s.tiles)
    .innerJoin(s.tileSuppliers, eq(s.tiles.id, s.tileSuppliers.tileId))
    .innerJoin(s.suppliers, eq(s.tileSuppliers.supplierId, s.suppliers.id))
    .where(and(eq(s.suppliers.handle, supplierHandle)))
    .orderBy(desc(s.tiles.createdAt))
}

async function getManyRawByUserId(userId: string): Promise<t.TileRaw[]> {
  return db
    .select(s.tileColumns)
    .from(s.tiles)
    .innerJoin(s.savedTiles, eq(s.tiles.id, s.savedTiles.tileId))
    .where(and(eq(s.savedTiles.userId, userId), eq(s.savedTiles.isSaved, true)))
    .orderBy(desc(s.tiles.createdAt))
}

async function createRaw(tileRawData: t.InsertTileRaw): Promise<t.TileRaw> {
  const tilesRaw = await db.insert(s.tiles).values(safeInsertTileRaw(tileRawData)).returning()
  return tilesRaw[0]
}

async function updateRaw(id: string, tileRawData: t.SetTileRaw): Promise<t.TileRaw> {
  const tilesRaw = await db.update(s.tiles).set(safeSetTileRaw(tileRawData)).where(eq(s.tiles.id, id)).returning()
  if (tilesRaw.length === 0) throw OPERATION_ERROR.RESOURCE_CONFLICT()
  return tilesRaw[0]
}

async function updateScore(id: string, score: number): Promise<t.TileRaw> {
  const tilesRaw = await db.update(s.tiles).set(safeSetScore({ score })).where(eq(s.tiles.id, id)).returning()
  if (tilesRaw.length === 0) throw OPERATION_ERROR.RESOURCE_CONFLICT()
  return tilesRaw[0]
}

async function deleteById(id: string): Promise<void> {
  await db.delete(s.tiles).where(eq(s.tiles.id, id))
}

async function deleteManyByIds(ids: string[]): Promise<void> {
  await db.delete(s.tiles).where(inArray(s.tiles.id, ids))
}

function safeInsertTileRaw(data: t.InsertTileRaw): t.InsertTileRaw {
  const now = new Date()
  return {
    createdAt: now,
    updatedAt: now,
    description: emptyStringToNull(data.description),
    createdByUserId: data.createdByUserId,
    imagePath: data.imagePath,
    title: emptyStringToNull(data.title),
    location: data.location,
    isPrivate: data.isPrivate,
  } satisfies t.InsertTileRaw
}

function safeSetTileRaw(data: t.SetTileRaw): t.SetTileRaw {
  const now = new Date()
  return {
    updatedAt: now,
    description: emptyStringToNull(data.description),
    title: emptyStringToNull(data.title),
    location: data.location,
  } satisfies t.SetTileRaw
}

function safeSetScore(data: t.SetScore): t.SetScore {
  const now = new Date()
  return {
    score: data.score,
    scoreUpdatedAt: now,
  } satisfies t.SetScore
}
