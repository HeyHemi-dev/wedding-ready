import { OPERATION_ERROR } from '@/app/_types/errors'
import { Tile, TileCredit, TileListItem } from '@/app/_types/tiles'
import { TileCreditForm } from '@/app/_types/validation-schema'
import { SavedTilesModel } from '@/models/savedTiles'
import { supplierModel } from '@/models/supplier'
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
    throw OPERATION_ERROR.NOT_FOUND
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
    throw OPERATION_ERROR.DATA_INTEGRITY
  }

  const supplier = await supplierModel.getRawById(supplierIds[0])
  if (!supplier) {
    throw OPERATION_ERROR.DATA_INTEGRITY
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
  const [tile, supplier] = await Promise.all([TileModel.getRawById(tileId), supplierModel.getRawById(credit.supplier.id)])

  if (!tile || !supplier) {
    throw OPERATION_ERROR.DATA_INTEGRITY
  }

  if (tile.createdByUserId !== userId) {
    throw OPERATION_ERROR.FORBIDDEN
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

async function getSavedState(tiles: t.TileRaw[], authUserId: string) {
  const savedTiles = await SavedTilesModel.getSavedTilesRaw(
    tiles.map((t) => t.id),
    authUserId
  )

  return tiles.map((tile) => ({
    ...tile,
    isSaved: savedTiles.find((st) => st.tileId === tile.id)?.isSaved ?? false,
  }))
}
