import { db } from '@/db/connection'
import * as s from '@/db/schema'
import * as t from '@/models/types'
import { OPERATION_ERROR } from '@/app/_types/errors'

export const viewedTilesModel = {
  upsertRaw,
}

/**
 * lets a user save/unsave a tile by upserting the saved tile relationship.
 * @returns The updated saved status of the tile
 */
async function upsertRaw(viewedTileData: t.InsertViewedTileRaw): Promise<t.ViewedTileRaw> {
  const savedTilesRaw = await db
    .insert(s.viewedTiles)
    .values(safeInsertViewedTileRaw(viewedTileData))
    .onConflictDoUpdate({
      target: [s.viewedTiles.tileId, s.viewedTiles.userId],
      set: safeSetViewedTileRaw({}),
    })
    .returning()
  if (savedTilesRaw.length === 0) throw OPERATION_ERROR.RESOURCE_CONFLICT()
  return savedTilesRaw[0]
}

function safeInsertViewedTileRaw(data: t.InsertViewedTileRaw): t.InsertViewedTileRaw {
  const now = new Date()
  return {
    userId: data.userId,
    tileId: data.tileId,
    viewedAt: now,
  } satisfies t.InsertViewedTileRaw
}

function safeSetViewedTileRaw(data: t.SetViewedTileRaw): t.SetViewedTileRaw {
  const now = new Date()
  return {
    viewedAt: now,
  } satisfies t.SetViewedTileRaw
}
