import { SupplierModel } from '@/models/supplier'
import { TileModel } from '@/models/tile'
import { Service } from '@/db/constants'
import * as t from '@/models/types'
import { Tile, TileListItem } from '@/app/_types/tiles'
import { TileSupplierModel } from '@/models/tileSupplier'

export const tileOperations = {
  getById,
  getListForSupplier,
  createForSupplier,
  addCredit,
}

async function getById(id: string, authUserId?: string): Promise<Tile> {
  const [tile, tileCredits] = await Promise.all([TileModel.getById(id, authUserId), TileSupplierModel.getCreditsByTileId(id)])

  if (!tile) {
    throw new Error('Tile not found')
  }

  const tileWithCredits = {
    id: tile.id,
    imagePath: tile.imagePath,
    title: tile.title,
    description: tile.description,
    createdAt: tile.createdAt,
    createdByUserId: tile.createdByUserId,
    location: tile.location,
    isSaved: tile.isSaved,
    credits: tileCredits.map((credit) => ({
      supplierHandle: credit.supplier.handle,
      supplierName: credit.supplier.name,
      service: credit.service,
      serviceDescription: credit.serviceDescription,
    })),
  }

  return tileWithCredits
}

async function getListForSupplier(supplierId: string, authUserId?: string): Promise<TileListItem[]> {
  const tiles = await TileModel.getBySupplierId(supplierId, authUserId)
  return tiles.map((tile) => ({
    id: tile.id,
    imagePath: tile.imagePath,
    title: tile.title,
    description: tile.description,
    isSaved: tile.isSaved,
  }))
}

async function createForSupplier({ InsertTileRawData, supplierIds }: { InsertTileRawData: t.InsertTileRaw; supplierIds: string[] }): Promise<{ id: string }> {
  if (!InsertTileRawData.imagePath) {
    throw new Error('imagePath must be set')
  }
  const tileRaw = await TileModel.createRaw(InsertTileRawData)
  await TileSupplierModel.createRaw({ tileId: tileRaw.id, supplierId: supplierIds[0] })

  return {
    id: tileRaw.id,
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

  await TileSupplierModel.createRaw({ tileId, supplierId: credit.supplierId, service: credit.service, serviceDescription: credit.serviceDescription })
  return TileSupplierModel.getCreditsByTileId(tileId)
}
