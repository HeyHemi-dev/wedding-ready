import { eq, and, desc, inArray, sql } from 'drizzle-orm'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { db } from '@/db/connection'
import * as s from '@/db/schema'
import type * as t from '@/models/types'
import { emptyStringToNull } from '@/utils/empty-strings'

export const tileModel = {
  getRawById,
  getManyRawBySupplierId,
  getManyRawBySupplierHandle,
  getManyRawByUserId,
  getFeed,
  createRaw,
  updateRaw,
  deleteById,
  deleteManyByIds,
}

type Feed = t.TileRaw & { score: number }

type GetFeedRawOptions = {
  cursorData: { score: number; createdAt: Date; tileId: string } | null
  limit: number
}

async function getFeed({ cursorData, limit }: GetFeedRawOptions): Promise<Feed[]> {
  // Build cursor filter SQL conditionally (applied after score calculation)
  let cursorFilter = ''
  if (cursorData) {
    const score = cursorData.score
    const createdAt = cursorData.createdAt.toISOString()
    const tileId = cursorData.tileId
    cursorFilter = `
      WHERE (
        ranked.score < ${score}
        OR (ranked.score = ${score} AND ranked.created_at < '${createdAt}')
        OR (ranked.score = ${score} AND ranked.created_at = '${createdAt}' AND ranked.id < '${tileId}')
      )
    `
  }

  const WEIGHTS = {
    recency: 0.4,
    quality: 0.3,
    social: 0.3,
  } as const

  // Raw SQL query with CTE for scoring
  const queryString = `
    WITH credit_counts AS (
      SELECT tile_id, COUNT(*)::int AS credit_count
      FROM tile_suppliers
      GROUP BY tile_id
    ),
    save_counts AS (
      SELECT tile_id, COUNT(*)::int AS save_count
      FROM saved_tiles
      WHERE is_saved = true
      GROUP BY tile_id
    ),
    ranked AS (
      SELECT 
        t.id,
        t.image_path AS "imagePath",
        t.title,
        t.description,
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt",
        t.created_by_user_id AS "createdByUserId",
        t.location,
        t.is_private AS "isPrivate",
        (
          ${WEIGHTS.recency} * (1.0 / (EXTRACT(EPOCH FROM (NOW() - t.created_at)) / 86400.0 + 1.0)) +
          ${WEIGHTS.quality} * (
            CASE WHEN t.title IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN t.description IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN COALESCE(cc.credit_count, 0) > 0 THEN 1 ELSE 0 END
          ) +
          ${WEIGHTS.social} * LN(GREATEST(COALESCE(sc.save_count, 0), 0) + 1.0)
        ) AS score
      FROM tiles t
      LEFT JOIN credit_counts cc ON t.id = cc.tile_id
      LEFT JOIN save_counts sc ON t.id = sc.tile_id
      WHERE t.is_private = false
    )
    SELECT * FROM ranked
    ${cursorFilter}
    ORDER BY score DESC, created_at DESC, id DESC
    LIMIT ${limit + 1}
  `

  const query = sql.raw(queryString)

  const results = (await db.execute(query)) as Array<Feed>

  return results
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
  const tilesRaw = await db.insert(s.tiles).values(safeInsertTileRaw(tileRawData)).returning()
  return tilesRaw[0]
}

async function updateRaw(id: string, tileRawData: t.SetTileRaw): Promise<t.TileRaw> {
  const tilesRaw = await db.update(s.tiles).set(safeSetTileRaw(tileRawData)).where(eq(s.tiles.id, id)).returning()
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
