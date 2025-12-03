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

export function filterTiles(tiles: t.TileWithScore[], { cursorData }: { cursorData: CursorData | null }): t.TileWithScore[] {
  if (cursorData) {
    return tiles.filter((tile) => {
      // Explicitly exclude the cursor tile itself
      if (tile.id === cursorData.tileId) return false
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
