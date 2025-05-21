import { SupplierModel } from '@/models/supplier'
import { TileModel } from '@/models/tile'
import * as t from '@/models/types'


export const tileActions = {
  createForSupplier,
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
