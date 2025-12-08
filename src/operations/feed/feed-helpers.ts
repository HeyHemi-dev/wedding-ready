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

export const WEIGHTS = {
  recency: 0.3, // recency has a threshold for super recent tiles
  quality: 0.2,
  social: 0.5,
  total: () => WEIGHTS.recency + WEIGHTS.quality + WEIGHTS.social,
} as const

export const RECENCY = {
  THRESHOLD_SECONDS: 5 * 60,
  MAX_AGE_SECONDS: 7 * 24 * 60 * 60,
} as const

export const QUALITY = {
  MAX_SCORE_TITLE: 0.1,
  MAX_SCORE_DESCRIPTION: 0.1,
  MAX_SCORE_CREDIT: 0.8,
  SCORE_FIRST_CREDIT: 0.3,
  MAX_NUM_CREDITS: 8,
  SCORE_PER_ADDITIONAL_CREDIT: () => (QUALITY.MAX_SCORE_CREDIT - QUALITY.SCORE_FIRST_CREDIT) / (QUALITY.MAX_NUM_CREDITS - 2), // subtract 2 for first and second credits
} as const

export const SOCIAL = {
  DECAY: 60,
} as const

export function calculateScore(tile: t.TileRaw, creditCount: number, saveCount: number): number {
  const now = Date.now()
  const createdAt = tile.createdAt.getTime()
  if (createdAt > now || creditCount < 0 || saveCount < 0) {
    throw OPERATION_ERROR.VALIDATION_ERROR()
  }

  // Recency, max score of 1.0.
  if (now - createdAt < RECENCY.THRESHOLD_SECONDS * 1000) return 1 // super recent tiles get perfect score

  // Hyperbolic decay approaches 0.0 over RECENCY_MAX_AGE_SECONDS.
  const secondsSinceCreation = (now - createdAt) / 1000
  const recencyScore = Math.max(0, 1.0 / (1 + (secondsSinceCreation / (RECENCY.MAX_AGE_SECONDS / 2)) ** 2))

  // Quality, max score of 1.0.
  // 0.1 point for title; 0.1 point for description; 0 points for 1st credit + 0.3 points for 2nd credit + 0.1 point for each additional credit (up to max of 0.8).
  const creditScore = Math.min(
    creditCount <= 1 ? 0 : QUALITY.SCORE_FIRST_CREDIT + QUALITY.SCORE_PER_ADDITIONAL_CREDIT() * Math.min(creditCount - 2, QUALITY.MAX_NUM_CREDITS),
    QUALITY.MAX_SCORE_CREDIT
  )
  const qualityScore = (tile.title ? QUALITY.MAX_SCORE_TITLE : 0) + (tile.description ? QUALITY.MAX_SCORE_DESCRIPTION : 0) + creditScore

  // Social, approaches max score of 1.0.
  // First save is worth the most, each extra save adds less.
  const socialScore = 1 - Math.exp(-saveCount / SOCIAL.DECAY)

  // return normalised score between 0 and 1, rounded to 9 decimal places
  const weightedSum = WEIGHTS.recency * recencyScore + WEIGHTS.quality * qualityScore + WEIGHTS.social * socialScore
  const normalisedScore = weightedSum / WEIGHTS.total()
  return Math.round(normalisedScore * 1e9) / 1e9
}
