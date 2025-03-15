import { db } from '@/db/db'
import { supplierColumns, tileColumns } from './types'
import type * as types from './types'
import * as schema from '@/db/schema'
import { eq, and, inArray, isNotNull } from 'drizzle-orm'
import { createBatchUpdateObject } from '@/utils/db-utils'

const tileBaseQuery = db
  .select({
    ...tileColumns,
    supplier: schema.suppliers,
  })
  .from(schema.tiles)
  .leftJoin(schema.tileSuppliers, eq(schema.tiles.id, schema.tileSuppliers.tileId))
  .leftJoin(schema.suppliers, eq(schema.tileSuppliers.supplierId, schema.suppliers.id))

interface TileBaseQueryResult extends types.TileRaw {
  supplier: types.Supplier | null
}

export class TileModel {
  private tile: types.Tile

  constructor(tile: types.Tile) {
    this.tile = tile
  }

  static async getRawById(id: string): Promise<types.TileRaw | null> {
    const tiles = await db.select().from(schema.tiles).where(eq(schema.tiles.id, id)).limit(1)
    return tiles.length ? tiles[0] : null
  }

  static async getBySupplier(supplier: types.Supplier, user?: types.UserWithDetail): Promise<types.Tile[]> {
    const result = await tileBaseQuery.where(
      and(eq(schema.tileSuppliers.supplierId, supplier.id), eq(schema.tiles.isPrivate, false), isNotNull(schema.tiles.imagePath))
    )

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

  static async createRaw(tileData: types.InsertTileRaw): Promise<types.TileRaw> {
    const tiles = await db.insert(schema.tiles).values(tileData).returning()
    return tiles[0]
  }

  /**
   * Create a tile and its relationships with suppliers
   * @requires tileSuppliers - List of suppliers to be related to this tile. Will not update the suppliers themselves.
   */
  static async createRawWithSuppliers(tileData: types.InsertTileRaw, tileSuppliers: types.Supplier[]): Promise<types.TileRawWithSuppliers> {
    const tiles = await db.insert(schema.tiles).values(tileData).returning()
    const tile = tiles[0]

    await db.insert(schema.tileSuppliers).values(
      tileSuppliers.map((supplier) => ({
        tileId: tile.id,
        supplierId: supplier.id,
      }))
    )

    const suppliers = await db
      .select({ ...supplierColumns })
      .from(schema.suppliers)
      .innerJoin(schema.tileSuppliers, eq(schema.suppliers.id, schema.tileSuppliers.supplierId))
      .where(eq(schema.tileSuppliers.tileId, tile.id))

    return {
      ...tile,

      suppliers: suppliers,
    }
  }

  /**
   * Update multiple rows in the tiles table
   * @param tilesData - array. overwrites the existing tile data
   * @returns The updated tiles
   */
  static async updateAllRaw(tilesData: types.TileRaw[]): Promise<types.TileRaw[]> {
    if (tilesData.length === 0) {
      return []
    }

    const updateObj = createBatchUpdateObject(tilesData, 'id', schema.tiles)

    const tiles = await db
      .update(schema.tiles)
      .set(updateObj)
      .where(
        inArray(
          schema.tiles.id,
          tilesData.map((tile) => tile.id)
        )
      )
      .returning()

    return tiles
  }

  /**
   * Update a tile and its relationships with suppliers
   * @param tileData - overwrites the existing tile data
   * @param tileSuppliers - optional. If passed it will overwrite the existing tileSupplier relationships. Will not update the suppliers themselves.
   * @requires tileData.imagePath - The path to the tile image
   * @returns The updated tile
   */
  static async update(tileData: types.TileRaw, tileSuppliers?: types.Supplier[]): Promise<types.Tile> {
    if (!tileData.imagePath) {
      throw new Error('imagePath is required')
    }

    const tiles = await db.update(schema.tiles).set(tileUpdateSafe(tileData)).where(eq(schema.tiles.id, tileData.id)).returning()
    const tile = tiles[0]

    if (tileSuppliers) {
      // Get status of existing tileSupplier relationships
      const existingTileSuppliers = await db.select().from(schema.tileSuppliers).where(eq(schema.tileSuppliers.tileId, tile.id))
      const supplierIdsToKeep = tileSuppliers.map((s) => s.id)
      const supplierIdsToRemove = existingTileSuppliers.filter((ts) => !supplierIdsToKeep.includes(ts.supplierId)).map((ts) => ts.supplierId)
      const supplierIdsToAdd = tileSuppliers.filter((s) => !existingTileSuppliers.some((ts) => ts.supplierId === s.id)).map((s) => s.id)

      // Remove old relationships
      if (supplierIdsToRemove.length > 0) {
        await db
          .delete(schema.tileSuppliers)
          .where(and(eq(schema.tileSuppliers.tileId, tile.id), inArray(schema.tileSuppliers.supplierId, supplierIdsToRemove)))
      }

      // Add new relationships
      if (supplierIdsToAdd.length > 0) {
        await db.insert(schema.tileSuppliers).values(
          supplierIdsToAdd.map((supplierId) => ({
            tileId: tile.id,
            supplierId: supplierId,
          }))
        )
      }
    }

    // Get updated suppliers list
    const suppliers = await db
      .select({ ...supplierColumns })
      .from(schema.suppliers)
      .innerJoin(schema.tileSuppliers, eq(schema.suppliers.id, schema.tileSuppliers.supplierId))
      .where(eq(schema.tileSuppliers.tileId, tile.id))

    return {
      ...tile,
      imagePath: tile.imagePath!, // We can assert that imagePath exists because we already threw an error if it was missing.
      suppliers: suppliers,
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
