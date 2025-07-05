import { SupplierModel } from '@/models/supplier'
import { TileModel } from '@/models/tile'
import { Service } from '@/db/constants'
import * as t from '@/models/types'

export const tileOperations = {
  createForSupplier,
  addCredit,
}

async function createForSupplier({ InsertTileRawData, supplierIds }: { InsertTileRawData: t.InsertTileRaw; supplierIds: string[] }): Promise<t.Tile> {
  if (!InsertTileRawData.imagePath) {
    throw new Error('imagePath must be set')
  }
  const tileRaw = await TileModel.createRaw(InsertTileRawData)
  await TileModel.addSuppliers(tileRaw.id, supplierIds)
  const suppliers = await SupplierModel.getAllByTileId(tileRaw.id)

  return {
    ...tileRaw,
    imagePath: tileRaw.imagePath!, //we can safely assert that imagePath set because we check for it before passing to createRaw function
    suppliers: suppliers,
  }
}

async function addCredit({
  tileId,
  credit,
  userId,
}: {
  tileId: string
  credit: { supplierId: string; service?: Service; serviceDescription?: string }
  userId: string
}): Promise<t.TileCredit[]> {
  const tile = await TileModel.getRawById(tileId)
  if (!tile) {
    throw new Error('Tile not found')
  }
  if (tile.createdByUserId !== userId) {
    throw new Error('Unauthorized')
  }

  await TileModel.addSupplierCredit(tileId, credit)
  return TileModel.getCredits(tileId)
}
