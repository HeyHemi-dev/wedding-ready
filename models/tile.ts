import { db } from '@/db/db'
import type * as t from './types'
import * as s from '@/db/schema'
import { eq, and, inArray, isNotNull, desc } from 'drizzle-orm'
import { createBatchUpdateObject } from '@/utils/db-utils'
import { tryCatch } from '@/utils/try-catch'

const tileBaseQuery = db
  .select({
    ...s.tileColumns,
    supplier: s.suppliers,
  })
  .from(s.tiles)
  .leftJoin(s.tileSuppliers, eq(s.tiles.id, s.tileSuppliers.tileId))
  .leftJoin(s.suppliers, eq(s.tileSuppliers.supplierId, s.suppliers.id))

interface TileBaseQueryResult extends t.TileRaw {
  supplier: t.SupplierRaw | null
}

export class TileModel {
  private tile: t.Tile

  constructor(tile: t.Tile) {
    this.tile = tile
  }

  static async getRawById(id: string): Promise<t.TileRaw | null> {
    const tilesRaw = await db.select().from(s.tiles).where(eq(s.tiles.id, id)).limit(1)
    return tilesRaw.length ? tilesRaw[0] : null
  }

  static async getBySupplierId(supplierId: string, authUserId?: string): Promise<t.Tile[]> {
    const { data: result, error } = await tryCatch(
      tileBaseQuery
        .where(and(eq(s.tileSuppliers.supplierId, supplierId), eq(s.tiles.isPrivate, false), isNotNull(s.tiles.imagePath)))
        .orderBy(desc(s.tiles.createdAt))
    )

    if (error) {
      throw new Error('database error')
    }

    // Since we're filtering for non-null imagePath in the query, we can safely assert the type
    const tiles = aggregateTileQueryResults(result) as t.Tile[]

    // Get the user's saved status for each tile
    if (authUserId) {
      const { data: savedTiles, error } = await tryCatch(getSavedTilesRaw(tiles, authUserId))

      if (error) {
        throw new Error('database error')
      }

      for (const tile of tiles) {
        tile.isSaved = savedTiles.find((st) => st.tileId === tile.id)?.isSaved ?? false
      }
    }

    return tiles
  }

  static async getByUserId(userId: string, authUserId?: string): Promise<t.Tile[]> {
    const { data: result, error } = await tryCatch(
      tileBaseQuery.leftJoin(s.savedTiles, eq(s.tiles.id, s.savedTiles.tileId)).where(and(eq(s.savedTiles.userId, userId), isNotNull(s.tiles.imagePath)))
    )

    if (error) {
      throw new Error('database error')
    }

    const tiles = aggregateTileQueryResults(result) as t.Tile[]

    if (authUserId) {
      const { data: savedTiles, error } = await tryCatch(getSavedTilesRaw(tiles, authUserId))

      if (error) {
        throw new Error('database error')
      }

      for (const tile of tiles) {
        tile.isSaved = savedTiles.find((st) => st.tileId === tile.id)?.isSaved ?? false
      }
    }

    return tiles
  }

  /**
   * Create a placeholder tile
   * @note Do not use this function to create a tile with an imagePath
   */
  static async createRaw(tileRawData: t.InsertTileRaw): Promise<t.TileRaw> {
    if (tileRawData.imagePath) {
      throw new Error('imagePath must not be set')
    }
    const tilesRaw = await db.insert(s.tiles).values(tileRawData).returning()
    return tilesRaw[0]
  }

  /**
   * Create a placeholder tile and its relationships with suppliers
   * @note Do not use this function to create a tile with an imagePath
   * @requires tileSuppliers - List of suppliers to be related to this tile. Will not update the suppliers themselves.
   */
  static async createRawWithSuppliers(tileRawData: t.InsertTileRaw, suppliersRaw: t.SupplierRaw[]): Promise<t.TileRawWithSuppliers> {
    if (tileRawData.imagePath) {
      throw new Error('imagePath must not be set')
    }
    const tilesRaw = await db.insert(s.tiles).values(tileRawData).returning()
    const tileRaw = tilesRaw[0]

    await db.insert(s.tileSuppliers).values(
      suppliersRaw.map((supplier) => ({
        tileId: tileRaw.id,
        supplierId: supplier.id,
      }))
    )

    const suppliers = await db
      .select({ ...s.supplierColumns })
      .from(s.suppliers)
      .innerJoin(s.tileSuppliers, eq(s.suppliers.id, s.tileSuppliers.supplierId))
      .where(eq(s.tileSuppliers.tileId, tileRaw.id))

    return {
      ...tileRaw,
      suppliers,
    }
  }

  /**
   * Update a tile and its relationships with suppliers
   * @param tileRawData - overwrites the existing tile data
   * @param suppliersRaw - optional. If passed it will overwrite the existing tileSupplier relationships. Will not update the suppliers themselves.
   * @requires tileRawData.imagePath - The path to the tile image
   * @returns The updated tile
   */
  static async update(tileRawData: t.TileRaw, suppliersRaw?: t.SupplierRaw[]): Promise<t.Tile> {
    if (!tileRawData.imagePath) {
      throw new Error('imagePath is required')
    }

    const tilesRaw = await db.update(s.tiles).set(tileUpdateSafe(tileRawData)).where(eq(s.tiles.id, tileRawData.id)).returning()
    const tileRaw = tilesRaw[0]

    if (suppliersRaw) {
      // Get status of existing tileSupplier relationships
      const existingTileSuppliers = await db.select().from(s.tileSuppliers).where(eq(s.tileSuppliers.tileId, tileRaw.id))
      const supplierIdsToKeep = suppliersRaw.map((s) => s.id)
      const supplierIdsToRemove = existingTileSuppliers.filter((ts) => !supplierIdsToKeep.includes(ts.supplierId)).map((ts) => ts.supplierId)
      const supplierIdsToAdd = suppliersRaw.filter((s) => !existingTileSuppliers.some((ts) => ts.supplierId === s.id)).map((s) => s.id)

      // Remove old relationships
      if (supplierIdsToRemove.length > 0) {
        await db.delete(s.tileSuppliers).where(and(eq(s.tileSuppliers.tileId, tileRaw.id), inArray(s.tileSuppliers.supplierId, supplierIdsToRemove)))
      }

      // Add new relationships
      if (supplierIdsToAdd.length > 0) {
        await db.insert(s.tileSuppliers).values(
          supplierIdsToAdd.map((supplierId) => ({
            tileId: tileRaw.id,
            supplierId: supplierId,
          }))
        )
      }
    }

    // Get updated suppliers list
    const updatedSuppliers = await db
      .select({ ...s.supplierColumns })
      .from(s.suppliers)
      .innerJoin(s.tileSuppliers, eq(s.suppliers.id, s.tileSuppliers.supplierId))
      .where(eq(s.tileSuppliers.tileId, tileRaw.id))

    return {
      ...tileRaw,
      imagePath: tileRaw.imagePath!, // We can assert that imagePath exists because we already threw an error if it was missing.
      suppliers: updatedSuppliers,
    }
  }

  static async getSavedStateRaw(tileId: string, userId: string): Promise<t.SavedTileRaw | null> {
    const savedTiles = await db
      .select()
      .from(s.savedTiles)
      .where(and(eq(s.savedTiles.tileId, tileId), eq(s.savedTiles.userId, userId)))
      .limit(1)

    return savedTiles.length ? savedTiles[0] : null
  }

  /**
   * lets a user save/unsave a tile by upserting the saved tile relationship.
   * @returns The updated saved status of the tile
   */
  static async updateSaveStateRaw(savedTileData: t.InsertSavedTileRaw): Promise<t.SavedTileRaw> {
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
}

function aggregateTileQueryResults(result: TileBaseQueryResult[]): t.TileRawWithSuppliers[] {
  // Create a map that we can iterate through for each tile
  const tileMap = new Map<string, t.TileRawWithSuppliers>()

  for (const row of result) {
    const key = row.id
    if (!tileMap.has(key)) {
      tileMap.set(key, {
        ...row,
        suppliers: [],
      })
    }

    const tileWithSuppliers = tileMap.get(key)!

    if (row.supplier && !tileWithSuppliers.suppliers.includes(row.supplier)) {
      tileWithSuppliers.suppliers.push(row.supplier)
    }
  }

  return Array.from(tileMap.values())
}

async function getSavedTilesRaw(tiles: t.TileRaw[] | t.Tile[], userId: string): Promise<t.SavedTileRaw[]> {
  const savedTiles = await db
    .select()
    .from(s.savedTiles)
    .where(
      and(
        eq(s.savedTiles.userId, userId),
        inArray(
          s.savedTiles.tileId,
          tiles.map((t) => t.id)
        )
      )
    )
  return savedTiles
}

/**
 * Removes fields that should not be updated from a TileRaw
 * @returns A safe update object with the updatedAt field set to the current date
 */
function tileUpdateSafe(tile: t.TileRaw | t.Tile): t.SetTileRaw {
  const { id, createdAt, createdByUserId, updatedAt, isPrivate, ...rest } = tile
  return {
    ...rest,
    updatedAt: new Date(),
  }
}
