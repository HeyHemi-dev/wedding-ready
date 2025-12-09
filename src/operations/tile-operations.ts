import { OPERATION_ERROR } from '@/app/_types/errors'
import { FeedQueryResult, Tile, TileCredit, TileListItem } from '@/app/_types/tiles'
import { TileCreditForm, TileCreate, FeedQuery, TileSaveState } from '@/app/_types/validation-schema'
import { savedTilesModel } from '@/models/saved-tiles'
import { supplierModel } from '@/models/supplier'
import { tileModel } from '@/models/tile'
import { tileSupplierModel } from '@/models/tile-supplier'
import * as t from '@/models/types'
import { userProfileModel } from '@/models/user'
import { updateScoreForTile } from '@/operations/feed/feed-helpers'
import { tryCatch } from '@/utils/try-catch'

export const tileOperations = {
  getById,
  getFeedForUser,
  getListForSupplier,
  getListForUser,
  createForSupplier,
  getCreditsForTile,
  createCreditForTile,
  upsertSaveState,
  updateScores,
}

async function getById(id: string, authUserId?: string): Promise<Tile> {
  const [tile, tileCredits] = await Promise.all([tileModel.getRawById(id), tileSupplierModel.getCreditsByTileId(id)])

  if (!tile) throw OPERATION_ERROR.RESOURCE_NOT_FOUND()

  const isSaved = authUserId ? await getSaveState(id, authUserId) : undefined

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
      supplierId: credit.supplierId,
      supplierHandle: credit.supplier.handle,
      supplierName: credit.supplier.name,
      service: credit.service,
      serviceDescription: credit.serviceDescription,
    })),
  }
}

async function getFeedForUser(authUserId: string, pageSize: number = 20): Promise<FeedQueryResult> {
  const MAX_PAGE_SIZE = Math.min(pageSize, 100) // Cap page size to prevent DoS attacks
  const tilesRaw = await tileModel.getFeed(authUserId, { limit: MAX_PAGE_SIZE })

  const tiles: TileListItem[] = tilesRaw.map((tile) => ({
    id: tile.id,
    imagePath: tile.imagePath,
    title: tile.title,
    description: tile.description,
    isSaved: false, // saved tiles have been filtered out in the query
  }))

  // If we got exactly the requested number of tiles, there might be more
  const hasNextPage = tilesRaw.length === MAX_PAGE_SIZE

  return {
    tiles,
    hasNextPage,
  }
}

async function getListForSupplier(supplierId: string, authUserId?: string): Promise<TileListItem[]> {
  const tiles = await tileModel.getManyRawBySupplierId(supplierId)

  const saveStatesMap = await getSaveStatesMap(
    tiles.map((t) => t.id),
    authUserId
  )

  return tiles.map((tile) => ({
    id: tile.id,
    imagePath: tile.imagePath,
    title: tile.title,
    description: tile.description,
    isSaved: saveStatesMap.get(tile.id),
  }))
}

async function getListForUser(userId: string, authUserId?: string): Promise<TileListItem[]> {
  const tiles = await tileModel.getManyRawByUserId(userId)

  // Get the current auth user's saved status for each tile
  // Note: the authUser can be different from the user we're getting tiles for.
  const saveStatesMap = await getSaveStatesMap(
    tiles.map((t) => t.id),
    authUserId
  )

  return tiles.map((tile) => ({
    id: tile.id,
    imagePath: tile.imagePath,
    title: tile.title,
    description: tile.description,
    isSaved: saveStatesMap.get(tile.id),
  }))
}

async function createForSupplier({ imagePath, title, description, location, createdByUserId, credits }: TileCreate): Promise<{ id: string }> {
  if (credits.length === 0) throw OPERATION_ERROR.BUSINESS_RULE_VIOLATION()

  // Tiles created for suppliers are always public
  const isPrivate = false

  const tileData: t.InsertTileRaw = { imagePath, title, description, location, createdByUserId, isPrivate }
  const tileRaw = await tileModel.createRaw(tileData)

  // We check if the supplier exists in uploadthing middleware
  await Promise.all(
    credits.map((credit) =>
      tileSupplierModel.createRaw({
        tileId: tileRaw.id,
        supplierId: credit.supplierId,
        service: credit.service,
        serviceDescription: credit.serviceDescription,
      })
    )
  )

  return {
    id: tileRaw.id,
  }
}

async function getCreditsForTile(tileId: string): Promise<TileCredit[]> {
  const tileCredits = await tileSupplierModel.getCreditsByTileId(tileId)
  return tileCredits.map((credit) => ({
    supplierId: credit.supplierId,
    supplierHandle: credit.supplier.handle,
    supplierName: credit.supplier.name,
    service: credit.service,
    serviceDescription: credit.serviceDescription,
  }))
}

async function createCreditForTile({ tileId, credit, authUserId }: { tileId: string; credit: TileCreditForm; authUserId: string }): Promise<TileCredit[]> {
  const [tile, supplier] = await Promise.all([tileModel.getRawById(tileId), supplierModel.getRawById(credit.supplierId)])

  if (!tile || !supplier) {
    throw OPERATION_ERROR.RESOURCE_NOT_FOUND()
  }
  // Only the person who created the tile can add a credit
  if (tile.createdByUserId !== authUserId) {
    throw OPERATION_ERROR.FORBIDDEN()
  }

  await tileSupplierModel.createRaw({ tileId, supplierId: credit.supplierId, service: credit.service, serviceDescription: credit.serviceDescription })
  const tileCredits = await tileSupplierModel.getCreditsByTileId(tileId)

  const { error } = await tryCatch(updateScoreForTile(tile))
  if (error) console.error(error) // Don't fail the operation if the score update fails

  return tileCredits.map((credit) => ({
    supplierId: credit.supplierId,
    supplierHandle: credit.supplier.handle,
    supplierName: credit.supplier.name,
    service: credit.service,
    serviceDescription: credit.serviceDescription,
  }))
}

async function upsertSaveState(tileId: string, authUserId: string, isSaved: boolean): Promise<TileSaveState> {
  const [tile, user] = await Promise.all([tileModel.getRawById(tileId), userProfileModel.getRawById(authUserId)])
  if (!tile || !user) throw OPERATION_ERROR.RESOURCE_NOT_FOUND()

  const savedTile = await savedTilesModel.upsertRaw({ tileId, userId: authUserId, isSaved })

  const { error } = await tryCatch(updateScoreForTile(tile))
  if (error) console.error(error) // Don't fail the operation if the score update fails

  return { isSaved: savedTile.isSaved }
}

/**
 * Updates the scores for all tiles that have stale scores.
 */
async function updateScores(): Promise<void> {
  const tiles = await tileModel.getRawByStaleScore()
  if (tiles.length === 0) return

  await Promise.all(tiles.map((tile) => updateScoreForTile(tile)))
}

async function getSaveState(tileId: string, authUserId: string): Promise<boolean> {
  const savedTile = await savedTilesModel.getRaw(tileId, authUserId)
  return savedTile?.isSaved ?? false
}

/**
 * Creates a map of tile ids with their saved state.
 * @param tileIds - The ids of the tiles to create the map for.
 * @param authUserId - The id of the authenticated user. If not provided, all tiles will be initialized as undefined (no saved state).
 * @returns A map of tile ids to their saved state.
 */

export async function getSaveStatesMap(tileIds: string[], authUserId: string | undefined): Promise<Map<string, boolean | undefined>> {
  // If user is authenticated, initialize all tiles as false (not saved)
  // Otherwise, initialize all tiles as undefined (no saved state)
  const saveStatesMap = new Map<string, boolean | undefined>(tileIds.map((id) => [id, authUserId ? false : undefined]))
  if (authUserId) {
    const savedTiles = await savedTilesModel.getManyRaw(tileIds, authUserId)
    savedTiles.forEach((st) => saveStatesMap.set(st.tileId, st.isSaved))
  }
  return saveStatesMap
}
