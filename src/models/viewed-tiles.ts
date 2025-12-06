import { OPERATION_ERROR } from '@/app/_types/errors'
import { db } from '@/db/connection'
import * as s from '@/db/schema'
import * as t from '@/models/types'

export const viewedTilesModel = {
  upsertRaw,
}

/**
 * Records that a user has viewed a tile in their feed by upserting the viewed tile relationship.
 * @returns The updated viewed tile record
 */
async function upsertRaw(viewedTileData: t.InsertViewedTileRaw): Promise<t.ViewedTileRaw> {
  const viewedTilesRaw = await db
    .insert(s.viewedTiles)
    .values(safeInsertViewedTileRaw(viewedTileData))
    .onConflictDoUpdate({
      target: [s.viewedTiles.tileId, s.viewedTiles.userId],
      set: safeSetViewedTileRaw({}),
    })
    .returning()
  if (viewedTilesRaw.length === 0) throw OPERATION_ERROR.RESOURCE_CONFLICT()
  return viewedTilesRaw[0]
}

function safeInsertViewedTileRaw(data: t.InsertViewedTileRaw): t.InsertViewedTileRaw {
  const now = new Date()
  return {
    userId: data.userId,
    tileId: data.tileId,
    viewedAt: now,
  } satisfies t.InsertViewedTileRaw
}

//eslint-disable-next-line @typescript-eslint/no-unused-vars
function safeSetViewedTileRaw(data: t.SetViewedTileRaw): t.SetViewedTileRaw {
  const now = new Date()
  return {
    viewedAt: now,
  } satisfies t.SetViewedTileRaw
}
