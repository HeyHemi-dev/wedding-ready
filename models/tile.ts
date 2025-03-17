import { db } from '@/db/db'
import type * as types from './types'
import * as schema from '@/db/schema'
import { eq, and, inArray, isNotNull, desc } from 'drizzle-orm'
import { createBatchUpdateObject } from '@/utils/db-utils'

const tileBaseQuery = db
  .select({
    ...schema.tileColumns,
    supplier: schema.suppliers,
  })
  .from(schema.tiles)
  .leftJoin(schema.tileSuppliers, eq(schema.tiles.id, schema.tileSuppliers.tileId))
  .leftJoin(schema.suppliers, eq(schema.tileSuppliers.supplierId, schema.suppliers.id))

interface TileBaseQueryResult extends types.TileRaw {
  supplier: types.SupplierRaw | null
}

export class TileModel {
  private tile: types.Tile

  constructor(tile: types.Tile) {
    this.tile = tile
  }

  static async getRawById(id: string): Promise<types.TileRaw | null> {
    const tilesRaw = await db.select().from(schema.tiles).where(eq(schema.tiles.id, id)).limit(1)
    return tilesRaw.length ? tilesRaw[0] : null
  }

  static async getBySupplier(supplier: types.SupplierRaw | types.Supplier, user?: types.User): Promise<types.Tile[]> {
    const result = await tileBaseQuery
      .where(and(eq(schema.tileSuppliers.supplierId, supplier.id), eq(schema.tiles.isPrivate, false), isNotNull(schema.tiles.imagePath)))
      .orderBy(desc(schema.tiles.createdAt))

    // Since we're filtering for non-null imagePath in the query, we can safely assert the types.
    const tiles = aggregateTileQueryResults(result) as types.Tile[]

    // Get the user's saved status for each tile
    if (user) {
      const savedTiles = await db
        .select()
        .from(schema.savedTiles)
        .where(
          and(
            eq(schema.savedTiles.userId, user.id),
            inArray(
              schema.savedTiles.tileId,
              tiles.map((t) => t.id)
            )
          )
        )
      for (const tile of tiles) {
        tile.isSaved = savedTiles.some((st) => st.tileId === tile.id)
      }
    }

    return tiles
  }

  /**
   * Create a placeholder tile
   * @note Do not use this function to create a tile with an imagePath
   */
  static async createRaw(tileRawData: types.InsertTileRaw): Promise<types.TileRaw> {
    if (tileRawData.imagePath) {
      throw new Error('imagePath must not be set')
    }
    const tilesRaw = await db.insert(schema.tiles).values(tileRawData).returning()
    return tilesRaw[0]
  }

  /**
   * Create a placeholder tile and its relationships with suppliers
   * @note Do not use this function to create a tile with an imagePath
   * @requires tileSuppliers - List of suppliers to be related to this tile. Will not update the suppliers themselves.
   */
  static async createRawWithSuppliers(tileRawData: types.InsertTileRaw, suppliersRaw: types.SupplierRaw[]): Promise<types.TileRawWithSuppliers> {
    if (tileRawData.imagePath) {
      throw new Error('imagePath must not be set')
    }
    const tilesRaw = await db.insert(schema.tiles).values(tileRawData).returning()
    const tileRaw = tilesRaw[0]

    await db.insert(schema.tileSuppliers).values(
      suppliersRaw.map((supplier) => ({
        tileId: tileRaw.id,
        supplierId: supplier.id,
      }))
    )

    const suppliers = await db
      .select({ ...schema.supplierColumns })
      .from(schema.suppliers)
      .innerJoin(schema.tileSuppliers, eq(schema.suppliers.id, schema.tileSuppliers.supplierId))
      .where(eq(schema.tileSuppliers.tileId, tileRaw.id))

    return {
      ...tileRaw,
      suppliers,
    }
  }

  /**
   * Update multiple rows in the tiles table
   * @param tilesRawData - array. overwrites the existing tile data
   * @returns The updated tiles
   */
  static async updateAllRaw(tilesRawData: types.TileRaw[]): Promise<types.TileRaw[]> {
    if (tilesRawData.length === 0) {
      return []
    }

    const updateObj = createBatchUpdateObject(tilesRawData, 'id', schema.tiles)

    const tiles = await db
      .update(schema.tiles)
      .set(updateObj)
      .where(
        inArray(
          schema.tiles.id,
          tilesRawData.map((tile) => tile.id)
        )
      )
      .returning()

    return tiles
  }

  /**
   * Update a tile and its relationships with suppliers
   * @param tileRawData - overwrites the existing tile data
   * @param suppliersRaw - optional. If passed it will overwrite the existing tileSupplier relationships. Will not update the suppliers themselves.
   * @requires tileRawData.imagePath - The path to the tile image
   * @returns The updated tile
   */
  static async update(tileRawData: types.TileRaw, suppliersRaw?: types.SupplierRaw[]): Promise<types.Tile> {
    if (!tileRawData.imagePath) {
      throw new Error('imagePath is required')
    }

    const tilesRaw = await db.update(schema.tiles).set(tileUpdateSafe(tileRawData)).where(eq(schema.tiles.id, tileRawData.id)).returning()
    const tileRaw = tilesRaw[0]

    if (suppliersRaw) {
      // Get status of existing tileSupplier relationships
      const existingTileSuppliers = await db.select().from(schema.tileSuppliers).where(eq(schema.tileSuppliers.tileId, tileRaw.id))
      const supplierIdsToKeep = suppliersRaw.map((s) => s.id)
      const supplierIdsToRemove = existingTileSuppliers.filter((ts) => !supplierIdsToKeep.includes(ts.supplierId)).map((ts) => ts.supplierId)
      const supplierIdsToAdd = suppliersRaw.filter((s) => !existingTileSuppliers.some((ts) => ts.supplierId === s.id)).map((s) => s.id)

      // Remove old relationships
      if (supplierIdsToRemove.length > 0) {
        await db
          .delete(schema.tileSuppliers)
          .where(and(eq(schema.tileSuppliers.tileId, tileRaw.id), inArray(schema.tileSuppliers.supplierId, supplierIdsToRemove)))
      }

      // Add new relationships
      if (supplierIdsToAdd.length > 0) {
        await db.insert(schema.tileSuppliers).values(
          supplierIdsToAdd.map((supplierId) => ({
            tileId: tileRaw.id,
            supplierId: supplierId,
          }))
        )
      }
    }

    // Get updated suppliers list
    const updatedSuppliers = await db
      .select({ ...schema.supplierColumns })
      .from(schema.suppliers)
      .innerJoin(schema.tileSuppliers, eq(schema.suppliers.id, schema.tileSuppliers.supplierId))
      .where(eq(schema.tileSuppliers.tileId, tileRaw.id))

    return {
      ...tileRaw,
      imagePath: tileRaw.imagePath!, // We can assert that imagePath exists because we already threw an error if it was missing.
      suppliers: updatedSuppliers,
    }
  }
}

function aggregateTileQueryResults(result: TileBaseQueryResult[]): types.TileRawWithSuppliers[] {
  // Create a map that we can iterate through for each tile
  const tileMap = new Map<string, types.TileRawWithSuppliers>()

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

/**
 * Removes fields that should not be updated from a TileRaw
 * @returns A safe update object with the updatedAt field set to the current date
 */
function tileUpdateSafe(tile: types.TileRaw | types.Tile): types.SetTileRaw {
  const { id, createdAt, createdByUserId, updatedAt, isPrivate, ...rest } = tile
  return {
    ...rest,
    updatedAt: new Date(),
  }
}
