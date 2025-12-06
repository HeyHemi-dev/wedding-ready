import { OPERATION_ERROR } from '@/app/_types/errors'
import { savedTilesModel } from '@/models/saved-tiles'
import { tileModel } from '@/models/tile'
import { tileSupplierModel } from '@/models/tile-supplier'
import * as t from '@/models/types'


export async function updateScore(tileId: string): Promise<void> {
  const [tile, creditCount, saveCount] = await Promise.all([
    tileModel.getRawById(tileId),
    tileSupplierModel.getCreditCountByTileId(tileId),
    savedTilesModel.getCountByTileId(tileId),
  ])
  if (!tile) throw OPERATION_ERROR.RESOURCE_NOT_FOUND()
  if (tile.isPrivate) return
  const score = calculateScore(tile, creditCount, saveCount)
  await tileModel.updateScore(tile.id, score)
}

// Should add up to 1.0
const WEIGHTS = {
  recency: 0.3, // recency already gets an additional boost for super recent tiles
  quality: 0.2,
  social: 0.5,
} as const

export function calculateScore(tile: t.TileRaw, creditCount: number, saveCount: number): number {
  const now = Date.now()
  const createdAt = tile.createdAt.getTime()
  if (createdAt > now || creditCount < 0 || saveCount < 0) {
    throw OPERATION_ERROR.VALIDATION_ERROR()
  }

  // Early return if tile is less than 5 mins old
  if (now - createdAt < 5 * 60 * 1000) return 1.0

  // Recency, max score of 1.0.
  // Decays to 0.0 over 7 days.
  const secondsSinceCreation = (now - createdAt) / 1000
  const recencyScore = Math.max(0, 1.0 - secondsSinceCreation / (7 * 24 * 60 * 60))

  // Quality, max score of 1.0.
  // 0.1 point for title; 0.1 point for description; 0 points for 1st credit + 0.3 points for 2nd credit + 0.1 point for each additional credit (up to max of 0.8).
  const creditScore = Math.min(creditCount <= 1 ? 0 : 0.3 + 0.1 * (creditCount - 2), 0.8)
  const qualityScore = (tile.title ? 0.1 : 0) + (tile.description ? 0.1 : 0) + creditScore

  // Social, approaches max score of 1.0.
  // First save is worth the most, each extra save adds less.
  const SOCIAL_DECAY = 60
  const socialScore = 1 - Math.exp(-saveCount / SOCIAL_DECAY)

  // return normalised score between 0 and 1, rounded to 9 decimal places
  const weightedSum = WEIGHTS.recency * recencyScore + WEIGHTS.quality * qualityScore + WEIGHTS.social * socialScore
  const totalWeight = WEIGHTS.recency + WEIGHTS.quality + WEIGHTS.social
  const normalisedScore = weightedSum / totalWeight
  return Math.round(normalisedScore * 1e9) / 1e9
}
