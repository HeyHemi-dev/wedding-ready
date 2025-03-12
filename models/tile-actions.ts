import { db } from '@/db/db'
import { InsertTileRaw, Tile, Supplier, InsertTileSupplier, supplierColumns } from './types'
import * as schema from '@/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
class TileActions {
  private tile: Tile

  constructor(tile: Tile) {
    this.tile = tile
  }

  static async createRaw(tileData: InsertTileRaw) {
    const tiles = await db.insert(schema.tiles).values(tileData).returning()
    return tiles[0]
  }

  static async create(tileData: InsertTileRaw, tileSuppliers: Supplier[]): Promise<Tile> {
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
   * Update a tile and its suppliers
   * @param tileData - overwrites the existing tile data
   * @param tileSuppliers - optional. If passed it will overwrite the existing tile suppliers
   * @returns The updated tile
   */
  static async update(tileData: InsertTileRaw, tileSuppliers?: Supplier[]): Promise<Tile> {
    if (!tileData.id) {
      throw new Error('Tile ID is required')
    }

    const tiles = await db.update(schema.tiles).set(tileData).where(eq(schema.tiles.id, tileData.id)).returning()
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
      suppliers: suppliers,
    }
  }
}

export default TileActions
