import { eq, and, inArray } from 'drizzle-orm'

import { db } from '@/db/connection'
import * as s from '@/db/schema'
import * as t from '@/models/types'

export const savedTilesModel = {
  getSavedTileRaw,
  getSavedTilesRaw,
  upsertSavedTileRaw,
}

async function getSavedTileRaw(tileId: string, userId: string): Promise<t.SavedTileRaw | null> {
  const savedTiles = await db
    .select()
    .from(s.savedTiles)
    .where(and(eq(s.savedTiles.tileId, tileId), eq(s.savedTiles.userId, userId)))
    .limit(1)
  return savedTiles.length ? savedTiles[0] : null
}

async function getSavedTilesRaw(tileIds: string[], userId: string): Promise<t.SavedTileRaw[]> {
  const savedTiles = await db
    .select()
    .from(s.savedTiles)
    .where(and(eq(s.savedTiles.userId, userId), inArray(s.savedTiles.tileId, tileIds)))
  return savedTiles
}

/**
 * lets a user save/unsave a tile by upserting the saved tile relationship.
 * @returns The updated saved status of the tile
 */
async function upsertSavedTileRaw(savedTileData: t.InsertSavedTileRaw): Promise<t.SavedTileRaw> {
  const savedTiles = await db
    .insert(s.savedTiles)
    .values(savedTileData)
    .onConflictDoUpdate({
      target: [s.savedTiles.tileId, s.savedTiles.userId],
      set: {
        isSaved: savedTileData.isSaved,
      },
    })
    .returning()
  return savedTiles[0]
}
