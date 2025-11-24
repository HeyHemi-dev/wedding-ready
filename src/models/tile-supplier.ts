import { eq } from 'drizzle-orm'

import { db } from '@/db/connection'
import * as s from '@/db/schema'
import * as t from '@/models/types'
import { emptyStringToNull } from '@/utils/empty-strings'

export const tileSupplierModel = {
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
  const tileSuppliersRaw = await db.insert(s.tileSuppliers).values(safeInsertTileSupplierRaw(tileSupplierRawData)).returning()
  return tileSuppliersRaw[0]
}

async function createManyRaw(tileSupplierRawData: t.InsertTileSupplierRaw[]): Promise<t.TileSupplierRaw[]> {
  const tileSuppliersRaw = await db.insert(s.tileSuppliers).values(tileSupplierRawData.map(safeInsertTileSupplierRaw)).returning()
  return tileSuppliersRaw
}

function safeInsertTileSupplierRaw(data: t.InsertTileSupplierRaw): t.InsertTileSupplierRaw {
  return {
    supplierId: data.supplierId,
    tileId: data.tileId,
    service: data.service,
    serviceDescription: emptyStringToNull(data.serviceDescription),
  } satisfies t.InsertTileSupplierRaw
}

function safeSetTileSupplierRaw(data: t.SetTileSupplierRaw): t.SetTileSupplierRaw {
  return {
    service: data.service,
    serviceDescription: emptyStringToNull(data.serviceDescription),
  } satisfies t.SetTileSupplierRaw
}
