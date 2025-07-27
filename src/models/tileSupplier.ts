import { db } from '@/db/connection'
import * as s from '@/db/schema'
import type * as t from './types'
import { eq } from 'drizzle-orm'
import { TileModel } from './tile'
import { SupplierModel } from './supplier'

export const TileSupplierModel = {
  getCreditsByTileId,
  createRaw,
  createManyRaw,
}

async function getCreditsByTileId(tileId: string): Promise<t.TileCredit[]> {
  const tileCredits = await db
    .select({
      ...s.tileSupplierColumns,
      supplier: s.suppliers,
    })
    .from(s.tileSuppliers)
    .innerJoin(s.suppliers, eq(s.tileSuppliers.supplierId, s.suppliers.id))
    .where(eq(s.tileSuppliers.tileId, tileId))

  return tileCredits
}

async function createRaw(tileSupplierRawData: t.InsertTileSupplierRaw): Promise<t.TileSupplierRaw> {
  const tile = await TileModel.getRawById(tileSupplierRawData.tileId)
  const supplier = await SupplierModel.getRawById(tileSupplierRawData.supplierId)

  if (!tile || !supplier) {
    throw new Error('Tile or supplier not found')
  }

  const tileSuppliers = await db.insert(s.tileSuppliers).values(tileSupplierRawData).returning()

  return tileSuppliers[0]
}

async function createManyRaw(tileSupplierRawData: t.InsertTileSupplierRaw[]): Promise<t.TileSupplierRaw[]> {
  const tileSuppliers = await db.insert(s.tileSuppliers).values(tileSupplierRawData).returning()
  return tileSuppliers
}
