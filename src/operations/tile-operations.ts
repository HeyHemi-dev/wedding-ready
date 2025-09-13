import { OPERATION_ERROR } from '@/app/_types/errors'
import { Tile, TileCredit, TileListItem } from '@/app/_types/tiles'
import { TileCreditForm, TileCreate } from '@/app/_types/validation-schema'
import { savedTilesModel } from '@/models/saved-tiles'
import { supplierModel } from '@/models/supplier'
import { tileModel } from '@/models/tile'
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
  const [tile, tileCredits] = await Promise.all([tileModel.getById(id), tileSupplierModel.getCreditsByTileId(id)])

  if (!tile) throw OPERATION_ERROR.NOT_FOUND()

  const isSaved = authUserId ? await getSavedState(id, authUserId) : undefined

  return {
    id: tile.id,
    imagePath: tile.imagePath,
    title: tile.title,
    description: tile.description,
    createdAt: tile.createdAt,
    createdByUserId: tile.createdByUserId,
    location: tile.location,
    isSaved,
    credits: tileCredits.map((credit) => ({
      supplierHandle: credit.supplier.handle,
      supplierName: credit.supplier.name,
      service: credit.service,
      serviceDescription: credit.serviceDescription,
    })),
  }
}

async function getListForSupplier(supplierId: string, authUserId?: string): Promise<TileListItem[]> {
  const tiles = await tileModel.getManyBySupplierId(supplierId)

  const savedStatesMap = new Map<string, boolean | undefined>(tiles.map((t) => [t.id, undefined]))
  if (authUserId) {
    const tileIds = tiles.map((t) => t.id)
    const savedStates = await getSavedStates(tileIds, authUserId)
    savedStates.forEach((st) => savedStatesMap.set(st.tileId, st.isSaved))
  }

  return tiles.map((tile) => ({
    id: tile.id,
    imagePath: tile.imagePath,
    title: tile.title,
    description: tile.description,
    isSaved: savedStatesMap.get(tile.id),
  }))
}

async function getListForUser(userId: string, authUserId?: string): Promise<TileListItem[]> {
  const tiles = await tileModel.getManyByUserId(userId)

  const savedStatesMap = new Map<string, boolean | undefined>(tiles.map((t) => [t.id, undefined]))
  if (authUserId) {
    // Get the current auth user's saved status for each tile
    // Note: the authUser can be different from the user we're getting tiles for.
    const tileIds = tiles.map((t) => t.id)
    const savedStates = await getSavedStates(tileIds, authUserId)
    savedStates.forEach((st) => savedStatesMap.set(st.tileId, st.isSaved))
  }

  return tiles.map((tile) => ({
    id: tile.id,
    imagePath: tile.imagePath,
    title: tile.title,
    description: tile.description,
    isSaved: savedStatesMap.get(tile.id),
  }))
}

async function createForSupplier({ imagePath, title, description, location, createdByUserId, isPrivate, credits }: TileCreate): Promise<{ id: string }> {
  if (credits.length === 0) throw OPERATION_ERROR.BAD_REQUEST()

  // TODO: Support multiple credits
  const credit = credits[0]
  const supplier = await supplierModel.getRawById(credit.supplierId)
  if (!supplier) throw OPERATION_ERROR.BAD_REQUEST()

  const tileData: t.InsertTileRaw = { imagePath, title, description, location, createdByUserId, isPrivate }

  const tileRaw = await tileModel.createRaw(tileData)
  await tileSupplierModel.createRaw({
    tileId: tileRaw.id,
    supplierId: credit.supplierId,
    service: credit.service,
    serviceDescription: credit.serviceDescription,
  })

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

async function createCreditForTile({ tileId, credit, authUserId }: { tileId: string; credit: TileCreditForm; authUserId: string }): Promise<TileCredit[]> {
  const [tile, supplier] = await Promise.all([tileModel.getRawById(tileId), supplierModel.getRawById(credit.supplierId)])

  if (!tile || !supplier) {
    throw OPERATION_ERROR.BAD_REQUEST()
  }

  if (tile.createdByUserId !== authUserId) {
    throw OPERATION_ERROR.UNAUTHORIZED()
  }

  await tileSupplierModel.createRaw({ tileId, supplierId: credit.supplierId, service: credit.service, serviceDescription: credit.serviceDescription })
  const tileCredits = await tileSupplierModel.getCreditsByTileId(tileId)

  return tileCredits.map((credit) => ({
    supplierHandle: credit.supplier.handle,
    supplierName: credit.supplier.name,
    service: credit.service,
    serviceDescription: credit.serviceDescription,
  }))
}

async function getSavedState(tileId: string, authUserId: string): Promise<boolean> {
  const savedTile = await savedTilesModel.getSavedTileRaw(tileId, authUserId)
  return savedTile?.isSaved ?? false
}

async function getSavedStates(tileIds: string[], authUserId: string): Promise<{ tileId: string; isSaved: boolean }[]> {
  const savedTiles = await savedTilesModel.getSavedTilesRaw(tileIds, authUserId)
  return tileIds.map((tileId) => ({
    tileId,
    isSaved: savedTiles.find((st) => st.tileId === tileId)?.isSaved ?? false,
  }))
}
