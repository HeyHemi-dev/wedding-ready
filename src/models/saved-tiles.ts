import { count, eq, and, inArray } from 'drizzle-orm'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { db } from '@/db/connection'
import * as s from '@/db/schema'
import * as t from '@/models/types'

export const savedTilesModel = {
  getSavedTileRaw,
  getSavedTilesRaw,
  getSaveCountByTileId,
  getSaveCountsByTileIds,
  upsertSavedTileRaw,
}

async function getSavedTileRaw(tileId: string, userId: string): Promise<t.SavedTileRaw | null> {
  const savedTilesRaw = await db
    .select()
    .from(s.savedTiles)
    .where(and(eq(s.savedTiles.tileId, tileId), eq(s.savedTiles.userId, userId)))
    .limit(1)
  if (savedTilesRaw.length === 0) return null
  return savedTilesRaw[0]
}

async function getSavedTilesRaw(tileIds: string[], userId: string): Promise<t.SavedTileRaw[]> {
  const savedTilesRaw = await db
    .select()
    .from(s.savedTiles)
    .where(and(eq(s.savedTiles.userId, userId), inArray(s.savedTiles.tileId, tileIds)))
  return savedTilesRaw
}

async function getSaveCountByTileId(tileId: string): Promise<number> {
  const result = await db
    .select({
      saveCount: count(s.savedTiles.tileId),
    })
    .from(s.savedTiles)
    .where(eq(s.savedTiles.tileId, tileId))
  return result[0].saveCount
}

async function getSaveCountsByTileIds(tileIds: string[]): Promise<Map<string, number>> {
  if (tileIds.length === 0) return new Map()
  const results = await db
    .select({
      tileId: s.savedTiles.tileId,
      saveCount: count(s.savedTiles.tileId),
    })
    .from(s.savedTiles)
    .where(and(eq(s.savedTiles.isSaved, true), inArray(s.savedTiles.tileId, tileIds)))
    .groupBy(s.savedTiles.tileId)
  return new Map(results.map((r) => [r.tileId, Number(r.saveCount)]))
}

/**
 * lets a user save/unsave a tile by upserting the saved tile relationship.
 * @returns The updated saved status of the tile
 */
async function upsertSavedTileRaw(savedTileData: t.InsertSavedTileRaw): Promise<t.SavedTileRaw> {
  const savedTilesRaw = await db
    .insert(s.savedTiles)
    .values(safeInsertSavedTileRaw(savedTileData))
    .onConflictDoUpdate({
      target: [s.savedTiles.tileId, s.savedTiles.userId],
      set: safeSetSavedTileRaw({
        isSaved: savedTileData.isSaved,
      }),
    })
    .returning()
  if (savedTilesRaw.length === 0) throw OPERATION_ERROR.RESOURCE_CONFLICT()
  return savedTilesRaw[0]
}

function safeInsertSavedTileRaw(data: t.InsertSavedTileRaw): t.InsertSavedTileRaw {
  return {
    userId: data.userId,
    tileId: data.tileId,
    isSaved: data.isSaved,
  } satisfies t.InsertSavedTileRaw
}

function safeSetSavedTileRaw(data: t.SetSavedTileRaw): t.SetSavedTileRaw {
  return {
    isSaved: data.isSaved,
  } satisfies t.SetSavedTileRaw
}
