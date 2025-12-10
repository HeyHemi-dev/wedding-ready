import { eq, and, desc, inArray, gte, isNull, or, lt } from 'drizzle-orm'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { db } from '@/db/connection'
import * as s from '@/db/schema'
import type * as t from '@/models/types'
import { emptyStringToNull } from '@/utils/empty-strings'

export const tileModel = {
  getRawById,
  getFeed,
  getManyRawBySupplierId,
  getManyRawBySupplierHandle,
  getManyRawByUserId,
  getRawByStaleScore,

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

type GetFeedOptions = {
  limit: number
}
/**
 * Gets tiles, sorted by score, that:
 * - have not been viewed by the user in the last 7 days
 * - are not saved by the user
 * - are not private
 *
 * Also marks the tiles as viewed by the user.
 * @param authUserId
 * @param {limit} limit - The maximum number of tiles to return.
 * @returns
 */
async function getFeed(authUserId: string, { limit }: GetFeedOptions): Promise<t.TileRaw[]> {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7)

  return db.transaction(async (tx) => {
    const tiles = await tx
      .select(s.tileColumns)
      .from(s.tiles)
      .leftJoin(s.viewedTiles, and(eq(s.viewedTiles.tileId, s.tiles.id), eq(s.viewedTiles.userId, authUserId), gte(s.viewedTiles.viewedAt, sevenDaysAgo)))
      .leftJoin(s.savedTiles, and(eq(s.savedTiles.tileId, s.tiles.id), eq(s.savedTiles.userId, authUserId), eq(s.savedTiles.isSaved, true)))
      .where(and(eq(s.tiles.isPrivate, false), isNull(s.viewedTiles.tileId), isNull(s.savedTiles.tileId)))
      .orderBy(desc(s.tiles.score))
      .limit(limit)
    if (tiles.length > 0) {
      await tx
        .insert(s.viewedTiles)
        .values(tiles.map((tile) => ({ userId: authUserId, tileId: tile.id })))
        .onConflictDoUpdate({
          target: [s.viewedTiles.userId, s.viewedTiles.tileId],
          set: { viewedAt: now },
        })
    }
    return tiles
  })
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

/**
 * Returns tiles whose score is STALE, using different thresholds depending on how old the tile is.
 */
async function getRawByStaleScore(): Promise<t.TileRaw[]> {
  const now = Date.now()
  const minutesAgo = (minutes: number) => new Date(now - 1000 * 60 * minutes)
  const hoursAgo = (hours: number) => new Date(now - 1000 * 60 * 60 * hours)
  const daysAgo = (days: number) => new Date(now - 1000 * 60 * 60 * 24 * days)

  return db
    .select(s.tileColumns)
    .from(s.tiles)
    .where(
      or(
        // created < 1 hour, score > 1 minute old
        and(gte(s.tiles.createdAt, hoursAgo(1)), lt(s.tiles.scoreUpdatedAt, minutesAgo(1))),

        // created 1–6 hours, score > 5 minutes old
        and(lt(s.tiles.createdAt, hoursAgo(1)), gte(s.tiles.createdAt, hoursAgo(6)), lt(s.tiles.scoreUpdatedAt, minutesAgo(5))),

        // created 6–24 hours, score > 15 minutes old
        and(lt(s.tiles.createdAt, hoursAgo(6)), gte(s.tiles.createdAt, hoursAgo(24)), lt(s.tiles.scoreUpdatedAt, minutesAgo(15))),

        // created 24–48 hours, score > 60 minutes old
        and(lt(s.tiles.createdAt, hoursAgo(24)), gte(s.tiles.createdAt, hoursAgo(48)), lt(s.tiles.scoreUpdatedAt, minutesAgo(60))),

        // created 2–7 days, score > 4 hours old
        and(lt(s.tiles.createdAt, daysAgo(2)), gte(s.tiles.createdAt, daysAgo(7)), lt(s.tiles.scoreUpdatedAt, hoursAgo(4))),

        // created 7–14 days, score > 1 day old
        and(lt(s.tiles.createdAt, daysAgo(7)), gte(s.tiles.createdAt, daysAgo(14)), lt(s.tiles.scoreUpdatedAt, daysAgo(1)))
      )
    )
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
    imageRatio: data.imageRatio,
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
