import { OPERATION_ERROR } from '@/app/_types/errors'
import { FeedQueryResult, Tile, TileCredit, TileListItem } from '@/app/_types/tiles'
import { TileCreditForm, TileCreate, FeedQuery } from '@/app/_types/validation-schema'
import { savedTilesModel } from '@/models/saved-tiles'
import { supplierModel } from '@/models/supplier'
import { tileModel } from '@/models/tile'
import { tileSupplierModel } from '@/models/tile-supplier'
import * as t from '@/models/types'
import { decodeCursor, encodeCursor, CursorData } from '@/operations/feed/cursor'
import { calculateScore, compareTiles, filterTiles } from '@/operations/feed/feed-helpers'

export const tileOperations = {
  getById,
  getFeed,
  getListForSupplier,
  getListForUser,
  createForSupplier,
  getCreditsForTile,
  createCreditForTile,
}

async function getById(id: string, authUserId?: string): Promise<Tile> {
  const [tile, tileCredits] = await Promise.all([tileModel.getRawById(id), tileSupplierModel.getCreditsByTileId(id)])

  if (!tile) throw OPERATION_ERROR.RESOURCE_NOT_FOUND()

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
      supplierId: credit.supplierId,
      supplierHandle: credit.supplier.handle,
      supplierName: credit.supplier.name,
      service: credit.service,
      serviceDescription: credit.serviceDescription,
    })),
  }
}

async function getFeed({ cursor, limit = 20 }: FeedQuery, authUserId?: string): Promise<FeedQueryResult> {
  // Decode cursor if provided
  let cursorData: CursorData | null = null
  if (cursor) {
    cursorData = decodeCursor(cursor)
  }

  // Fetch
  const BATCH_SIZE = Math.max(limit * 10, 1000)
  const tilesRaw = await tileModel.getManyRaw({ limit: BATCH_SIZE })
  const tileIds = tilesRaw.map((t) => t.id)
  const [creditCountsMap, saveCountsMap] = await Promise.all([
    tileSupplierModel.getCreditCountsByTileIds(tileIds),
    savedTilesModel.getSaveCountsByTileIds(tileIds),
  ])

  // Calculate scores
  const tilesWithScore: t.TileWithScore[] = tilesRaw.map((tile) => {
    const creditCount = creditCountsMap.get(tile.id) ?? 0
    const saveCount = saveCountsMap.get(tile.id) ?? 0
    const score = calculateScore(tile, creditCount, saveCount)
    return { ...tile, score }
  })

  // Sort (and handle ties)
  tilesWithScore.sort(compareTiles)

  // Filter
  let tilesToReturn = filterTiles(tilesWithScore, { cursorData })
  const hasNextPage = tilesToReturn.length > limit
  tilesToReturn = hasNextPage ? tilesToReturn.slice(0, limit) : tilesToReturn

  const savedStatesMap = await getSavedStatesMap(
    tilesToReturn.map((t) => t.id),
    authUserId
  )

  const tiles: TileListItem[] = tilesToReturn.map((tile) => ({
    id: tile.id,
    imagePath: tile.imagePath,
    title: tile.title,
    description: tile.description,
    isSaved: savedStatesMap.get(tile.id),
  }))

  // Generate next cursor from the last tile
  let nextCursor: string | null = null
  if (hasNextPage && tilesToReturn.length > 0) {
    const lastTile = tilesToReturn[tilesToReturn.length - 1]
    nextCursor = encodeCursor({ score: lastTile.score, createdAt: lastTile.createdAt, tileId: lastTile.id })
  }

  return {
    tiles,
    nextCursor,
    hasNextPage,
  }
}

async function getListForSupplier(supplierId: string, authUserId?: string): Promise<TileListItem[]> {
  const tiles = await tileModel.getManyRawBySupplierId(supplierId)

  const savedStatesMap = await getSavedStatesMap(
    tiles.map((t) => t.id),
    authUserId
  )

  return tiles.map((tile) => ({
    id: tile.id,
    imagePath: tile.imagePath,
    title: tile.title,
    description: tile.description,
    isSaved: savedStatesMap.get(tile.id),
  }))
}

async function getListForUser(userId: string, authUserId?: string): Promise<TileListItem[]> {
  const tiles = await tileModel.getManyRawByUserId(userId)

  // Get the current auth user's saved status for each tile
  // Note: the authUser can be different from the user we're getting tiles for.
  const savedStatesMap = await getSavedStatesMap(
    tiles.map((t) => t.id),
    authUserId
  )

  return tiles.map((tile) => ({
    id: tile.id,
    imagePath: tile.imagePath,
    title: tile.title,
    description: tile.description,
    isSaved: savedStatesMap.get(tile.id),
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

  return tileCredits.map((credit) => ({
    supplierId: credit.supplierId,
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

/**
 * Creates a map of tile ids with their saved state.
 * @param tileIds - The ids of the tiles to create the map for.
 * @param authUserId - The id of the authenticated user. If not provided, all tiles will be initialized as undefined (no saved state).
 * @returns A map of tile ids to their saved state.
 */

async function getSavedStatesMap(tileIds: string[], authUserId: string | undefined): Promise<Map<string, boolean | undefined>> {
  // If user is authenticated, initialize all tiles as false (not saved)
  // Otherwise, initialize all tiles as undefined (no saved state)
  const savedStatesMap = new Map<string, boolean | undefined>(tileIds.map((id) => [id, authUserId ? false : undefined]))
  if (authUserId) {
    const savedTiles = await savedTilesModel.getSavedTilesRaw(tileIds, authUserId)
    savedTiles.forEach((st) => savedStatesMap.set(st.tileId, st.isSaved))
  }
  return savedStatesMap
}
