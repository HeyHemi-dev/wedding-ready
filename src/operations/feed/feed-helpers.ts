import * as t from '@/models/types'

import { CursorData } from './cursor'

const WEIGHTS = {
  recency: 0.4,
  quality: 0.3,
  social: 0.3,
} as const

export function calculateScore(tile: t.TileRaw, creditCount: number, saveCount: number): number {
  const now = Date.now()
  const createdAt = tile.createdAt.getTime()
  const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24)
  const recencyScore = 1.0 / (daysSinceCreation + 1.0)

  const qualityScore = (tile.title ? 1 : 0) + (tile.description ? 1 : 0) + (creditCount > 0 ? 1 : 0)

  const socialScore = Math.log(Math.max(saveCount, 0) + 1.0)

  return WEIGHTS.recency * recencyScore + WEIGHTS.quality * qualityScore + WEIGHTS.social * socialScore
}

export function compareTiles(a: t.TileWithScore, b: t.TileWithScore): number {
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

/**
 * Filters out previously returned tiles based on the cursor data. Tiles must be pre-sorted by score, createdAt, and id.
 */

export function filterTiles(tiles: t.TileWithScore[], { cursorData }: { cursorData: CursorData | null }): t.TileWithScore[] {
  if (!cursorData) return tiles

  // Find the cursor tile's position in the sorted list
  // Since tiles are already sorted, we can find where the cursor tile is and return everything after it
  const cursorIndex = tiles.findIndex((t) => t.id === cursorData.tileId)
  if (cursorIndex >= 0) return tiles.slice(cursorIndex + 1)

  return tiles
}
