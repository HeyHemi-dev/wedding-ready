import { OPERATION_ERROR } from '@/app/_types/errors'
import { FeedQueryResult, Tile, TileCredit, TileListItem } from '@/app/_types/tiles'
import { TileCreditForm, TileCreate, FeedQuery } from '@/app/_types/validation-schema'
import { savedTilesModel } from '@/models/saved-tiles'
import { supplierModel } from '@/models/supplier'
import { tileModel } from '@/models/tile'
import { tileSupplierModel } from '@/models/tile-supplier'
import * as t from '@/models/types'
import { decodeCursor, encodeCursor, CursorData } from '@/operations/feed/cursor'

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

  // Fetch data
  const BATCH_SIZE = Math.max(limit * 10, 1000)
  const tilesRaw = await tileModel.getManyRaw({ limit: BATCH_SIZE })
  const tileIds = tilesRaw.map((t) => t.id)
  const [creditCountsMap, saveCountsMap] = await Promise.all([
    tileSupplierModel.getCreditCountsByTileIds(tileIds),
    savedTilesModel.getSaveCountsByTileIds(tileIds),
  ])

  // Calculate scores and create Feed array
  const tilesWithScore: t.TileWithScore[] = tilesRaw.map((tile) => {
    const creditCount = creditCountsMap.get(tile.id) ?? 0
    const saveCount = saveCountsMap.get(tile.id) ?? 0
    const score = calculateScore(tile, creditCount, saveCount)
    return { ...tile, score }
  })

  // Sort by score (and tiebreakers)
  tilesWithScore.sort(compareTiles)

  // Filter tiles
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

async function getSavedStatesMap(tileIds: string[], authUserId: string | undefined): Promise<Map<string, boolean | undefined>> {
  const savedStatesMap = new Map<string, boolean | undefined>(tileIds.map((id) => [id, undefined]))
  if (authUserId) {
    const savedTiles = await savedTilesModel.getSavedTilesRaw(tileIds, authUserId)
    savedTiles.forEach((st) => savedStatesMap.set(st.tileId, st.isSaved))
  }
  return savedStatesMap
}

// Feed helper functions

const WEIGHTS = {
  recency: 0.4,
  quality: 0.3,
  social: 0.3,
} as const

function calculateScore(tile: t.TileRaw, creditCount: number, saveCount: number): number {
  const now = Date.now()
  const createdAt = tile.createdAt.getTime()
  const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24)
  const recencyScore = 1.0 / (daysSinceCreation + 1.0)

  const qualityScore = (tile.title ? 1 : 0) + (tile.description ? 1 : 0) + (creditCount > 0 ? 1 : 0)

  const socialScore = Math.log(Math.max(saveCount, 0) + 1.0)

  return WEIGHTS.recency * recencyScore + WEIGHTS.quality * qualityScore + WEIGHTS.social * socialScore
}

function compareTiles(a: t.TileWithScore, b: t.TileWithScore): number {
  // Primary sort: score DESC
  if (b.score !== a.score) {
    return b.score - a.score
  }
  // Secondary sort: createdAt DESC
  if (b.createdAt.getTime() !== a.createdAt.getTime()) {
    return b.createdAt.getTime() - a.createdAt.getTime()
  }
  // Tertiary sort: id DESC (for deterministic ordering)
  return b.id.localeCompare(a.id)
}

function filterTiles(tiles: t.TileWithScore[], { cursorData }: { cursorData: CursorData | null }): t.TileWithScore[] {
  if (cursorData) {
    return tiles.filter((tile) => {
      // Lower score = comes after cursor in DESC sort
      if (tile.score < cursorData.score) return true
      // Higher score = comes before cursor, exclude
      if (tile.score > cursorData.score) return false
      // Same score: check createdAt (older = comes after in DESC sort)
      if (tile.createdAt.getTime() < cursorData.createdAt.getTime()) return true
      if (tile.createdAt.getTime() > cursorData.createdAt.getTime()) return false
      // Same score and createdAt: check id (smaller = comes after in DESC sort)
      return tile.id < cursorData.tileId
    })
  }
  return tiles
}
