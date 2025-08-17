import { Tile, TileCredit, TileListItem } from '@/app/_types/tiles'
import { TileCreditForm } from '@/app/_types/validation-schema'
import { TileModel } from '@/models/tile'
import { tileSupplierModel } from '@/models/tile-supplier'
import * as t from '@/models/types'

export const tileOperations = {
  getById,
  getListForSupplier,
  getListForUser,
  createForSupplier,
  getCreditsForTile,
  createCreditForTile,
}

async function getById(id: string, authUserId?: string): Promise<Tile> {
  const [tile, tileCredits] = await Promise.all([TileModel.getById(id, authUserId), tileSupplierModel.getCreditsByTileId(id)])

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

async function getListForUser(userId: string, authUserId?: string): Promise<TileListItem[]> {
  const tiles = await TileModel.getByUserId(userId, authUserId)
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
  await tileSupplierModel.createRaw({ tileId: tileRaw.id, supplierId: supplierIds[0] })

  return {
    id: tileRaw.id,
  }
}

async function getCreditsForTile(tileId: string): Promise<TileCredit[]> {
  const tileCredits = await tileSupplierModel.getCreditsByTileId(tileId)
  return tileCredits.map((credit) => ({
    supplierHandle: credit.supplier.handle,
    supplierName: credit.supplier.name,
    service: credit.service,
    serviceDescription: credit.serviceDescription,
  }))
}

async function createCreditForTile({ tileId, credit, userId }: { tileId: string; credit: TileCreditForm; userId: string }): Promise<TileCredit[]> {
  const tile = await TileModel.getRawById(tileId)
  if (!tile) {
    throw new Error('Tile not found')
  }
  if (tile.createdByUserId !== userId) {
    throw new Error('Unauthorized')
  }

  await tileSupplierModel.createRaw({ tileId, supplierId: credit.supplier.id, service: credit.service, serviceDescription: credit.serviceDescription })
  const tileCredits = await tileSupplierModel.getCreditsByTileId(tileId)

  return tileCredits.map((credit) => ({
    supplierHandle: credit.supplier.handle,
    supplierName: credit.supplier.name,
    service: credit.service,
    serviceDescription: credit.serviceDescription,
  }))
}
