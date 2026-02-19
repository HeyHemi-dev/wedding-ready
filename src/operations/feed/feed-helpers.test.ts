import { describe, expect, it } from 'vitest'

import { ERROR_MESSAGE } from '@/app/_types/errors'
import { LOCATIONS } from '@/db/constants'
import type * as t from '@/models/types'

import { calculateScore, RECENCY, QUALITY, WEIGHTS } from './feed-helpers'

function createMockTile(overrides: Partial<t.TileRaw> = {}): t.TileRaw {
  // use old tile to avoid recency score
  const old = new Date(Date.now() - RECENCY.MAX_AGE_SECONDS * 1000)

  // destructure createdAt so we can ensure updatedAt and scoreUpdatedAt are always the same as createdAt
  const { createdAt, ...rest } = overrides
  const createdDate = createdAt ?? old

  return {
    id: 'test-id',
    imagePath: 'https://example.com/image.jpg',
    title: null,
    description: null,
    createdByUserId: 'test-user-id',
    location: LOCATIONS.WELLINGTON,
    isPrivate: false,
    score: 1,
    scoreUpdatedAt: createdDate,
    createdAt: createdDate,
    updatedAt: createdDate,
    ...rest,
  } satisfies t.TileRaw
}

describe('feedHelpers', () => {
  it('should calculate the score correctly', () => {
    // Arrange
    const tile = createMockTile({
      createdAt: new Date(),
    })

    // Act
    const score = calculateScore(tile, 3, 14)

    // Assert
    expect(score).toBeDefined()
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(1)
  })

  describe('recency edge cases', () => {
    it('should return 1.0 for tiles less than THRESHOLD_SECONDS old', () => {
      // Arrange
      const now = Date.now()
      const tile = createMockTile({
        createdAt: new Date(now - (RECENCY.THRESHOLD_SECONDS - 60) * 1000), // less than threshold seconds ago
      })

      // Act
      const score = calculateScore(tile, 0, 0)

      // Assert
      expect(score).toBe(1.0)
    })

    it('should return 1.0 for tiles exactly THRESHOLD_SECONDS - 1 seconds old', () => {
      // Arrange
      const now = Date.now()
      const tile = createMockTile({
        createdAt: new Date(now - (RECENCY.THRESHOLD_SECONDS - 1) * 1000), // less than threshold seconds ago
      })

      // Act
      const score = calculateScore(tile, 0, 0)

      // Assert
      expect(score).toBe(1.0)
    })

    it('should calculate score for tiles exactly THRESHOLD_SECONDS old', () => {
      // Arrange
      const now = Date.now()
      const tile = createMockTile({
        createdAt: new Date(now - RECENCY.THRESHOLD_SECONDS * 1000),
      })

      // Act
      const score = calculateScore(tile, 0, 0)

      // Assert
      expect(score).toBeLessThan(WEIGHTS.recency)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should have recency score approaching 0 for MAX_AGE_SECONDS ago', () => {
      // Arrange
      const now = Date.now()
      const tile = createMockTile({
        createdAt: new Date(now - RECENCY.MAX_AGE_SECONDS * 1000),
      })

      // Act
      const score = calculateScore(tile, 0, 0)

      // Assert
      expect(score).toBeLessThan(0.1)
      expect(score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('quality edge cases', () => {
    it('should give MAX_SCORE_TITLE for title only', () => {
      // Arrange
      const old = Date.now() - RECENCY.MAX_AGE_SECONDS * 1000 // use old tile to avoid recency score
      const tileLowQuality = createMockTile({
        createdAt: new Date(old),
        title: null,
        description: null,
      })
      const tileWithTitle = createMockTile({
        createdAt: new Date(old),
        title: 'Test Title',
        description: null,
      })

      // Act
      const scoreLowQuality = calculateScore(tileLowQuality, 0, 0)
      const scoreWithTitle = calculateScore(tileWithTitle, 0, 0)

      // Assert
      expect(scoreWithTitle).toBeGreaterThan(0)
      expect(scoreWithTitle).toBeLessThanOrEqual(1)
      expect(scoreWithTitle).toBeGreaterThan(scoreLowQuality)
      expect(scoreWithTitle - scoreLowQuality).toBe(WEIGHTS.quality * QUALITY.MAX_SCORE_TITLE)
    })

    it('should give MAX_SCORE_DESCRIPTION for description only', () => {
      // Arrange
      const old = Date.now() - RECENCY.MAX_AGE_SECONDS * 1000 // use old tile to avoid recency score
      const tileLowQuality = createMockTile({
        createdAt: new Date(old),
        title: null,
        description: null,
      })
      const tileWithDescription = createMockTile({
        createdAt: new Date(old),
        title: null,
        description: 'Test Description',
      })

      // Act
      const scoreLowQuality = calculateScore(tileLowQuality, 0, 0)
      const scoreWithDescription = calculateScore(tileWithDescription, 0, 0)

      // Assert
      expect(scoreWithDescription).toBeGreaterThan(0)
      expect(scoreWithDescription).toBeLessThanOrEqual(1)
      expect(scoreWithDescription).toBeGreaterThan(scoreLowQuality)
      expect(scoreWithDescription - scoreLowQuality).toBe(WEIGHTS.quality * QUALITY.MAX_SCORE_DESCRIPTION)
    })

    it('should give MAX_SCORE_TITLE + MAX_SCORE_DESCRIPTION for both title and description', () => {
      // Arrange
      const old = Date.now() - RECENCY.MAX_AGE_SECONDS * 1000 // use old tile to avoid recency score
      const tileLowQuality = createMockTile({
        createdAt: new Date(old),
        title: null,
        description: null,
      })
      const tileWithTitleAndDescription = createMockTile({
        createdAt: new Date(old),
        title: 'Test Title',
        description: 'Test Description',
      })
      // Act
      const scoreLowQuality = calculateScore(tileLowQuality, 0, 0)
      const scoreWithTitleAndDescription = calculateScore(tileWithTitleAndDescription, 0, 0)

      expect(scoreWithTitleAndDescription).toBeGreaterThan(0)
      expect(scoreWithTitleAndDescription).toBeLessThanOrEqual(1)
      expect(scoreWithTitleAndDescription).toBeGreaterThan(scoreLowQuality)
      expect(scoreWithTitleAndDescription - scoreLowQuality).toBe(WEIGHTS.quality * (QUALITY.MAX_SCORE_TITLE + QUALITY.MAX_SCORE_DESCRIPTION))
    })

    it('should give 0 credit score for less than 2 credits', () => {
      // Arrange
      const tile = createMockTile()

      // Act
      const scoreWith0Credits = calculateScore(tile, 0, 0)
      const scoreWith1Credit = calculateScore(tile, 1, 0)

      // Assert
      expect(scoreWith0Credits).toBeGreaterThan(0)
      expect(scoreWith0Credits).toBeLessThanOrEqual(1)
      expect(scoreWith0Credits).toBe(scoreWith1Credit)
    })

    it('should give SCORE_FIRST_CREDIT for 2 credits', () => {
      // Arrange
      const tile = createMockTile()

      // Act
      const scoreWith0Credits = calculateScore(tile, 0, 0)
      const scoreWith2Credits = calculateScore(tile, 2, 0)

      // Assert
      expect(scoreWith2Credits).toBeGreaterThan(0)
      expect(scoreWith2Credits).toBeLessThanOrEqual(1)
      expect(scoreWith2Credits).toBeGreaterThan(scoreWith0Credits)
      expect(scoreWith2Credits - scoreWith0Credits).toBe(WEIGHTS.quality * QUALITY.SCORE_FIRST_CREDIT)
    })

    it('should give SCORE_FIRST_CREDIT + SCORE_PER_ADDITIONAL_CREDIT for 3 credits', () => {
      // Arrange
      const tile = createMockTile()

      // Act
      const scoreWith0Credits = calculateScore(tile, 0, 0)
      const scoreWith3Credits = calculateScore(tile, 3, 0)

      // Assert
      expect(scoreWith3Credits).toBeGreaterThan(0)
      expect(scoreWith3Credits).toBeLessThanOrEqual(1)
      expect(scoreWith3Credits).toBeGreaterThan(scoreWith0Credits)
      expect(scoreWith3Credits - scoreWith0Credits).toBeCloseTo(WEIGHTS.quality * (QUALITY.SCORE_FIRST_CREDIT + QUALITY.SCORE_PER_ADDITIONAL_CREDIT()), 6) // use closeTo to avoid floating point precision issues
    })

    it('should cap credit score at MAX_SCORE_CREDIT for many credits', () => {
      // Arrange
      const tile = createMockTile()

      // Act
      const scoreWith0Credits = calculateScore(tile, 0, 0)
      const scoreWithMaxCredits = calculateScore(tile, QUALITY.MAX_NUM_CREDITS, 0)
      const scoreWithManyCredits = calculateScore(tile, 100, 0)

      // Assert
      expect(scoreWithMaxCredits).toBeGreaterThan(0)
      expect(scoreWithMaxCredits).toBeLessThanOrEqual(1)
      expect(scoreWithMaxCredits).toBeGreaterThan(scoreWith0Credits)
      expect(scoreWithMaxCredits).toBe(scoreWithManyCredits)
      expect(scoreWithMaxCredits - scoreWith0Credits).toBeCloseTo(WEIGHTS.quality * QUALITY.MAX_SCORE_CREDIT, 6) // use closeTo to avoid floating point precision issues
    })
  })

  describe('social edge cases', () => {
    it('should have increasing social score with more saves', () => {
      // Arrange
      const tile = createMockTile()

      // Act
      const score1 = calculateScore(tile, 0, 1)
      const score10 = calculateScore(tile, 0, 10)
      const score100 = calculateScore(tile, 0, 100)

      // Assert
      expect(score1).toBeGreaterThan(0)
      expect(score10).toBeGreaterThan(score1)
      expect(score100).toBeGreaterThan(score10)
      expect(score100).toBeLessThanOrEqual(1)
    })

    it('should have social score approaching 1 for many saves', () => {
      // Arrange
      const tile = createMockTile()

      // Act
      const scoreWith0Saves = calculateScore(tile, 0, 0)
      const scoreWith1000Saves = calculateScore(tile, 0, 1000)

      // Social score is close to 1.0 with 1000 saves
      // With minimal recency and no quality, social component (0.5 weight) dominates
      expect(scoreWith1000Saves).toBeGreaterThan(0)
      expect(scoreWith1000Saves).toBeLessThanOrEqual(1)
      expect(scoreWith1000Saves - scoreWith0Saves).toBeCloseTo(WEIGHTS.social, 6) // use closeTo to avoid floating point precision issues
    })
  })

  describe('validation edge cases', () => {
    it('should throw validation error for future createdAt', () => {
      // Arrange
      const now = Date.now()
      const tile = createMockTile({
        createdAt: new Date(now + 1000), // 1 second in the future
      })

      // Act & Assert
      expect(() => calculateScore(tile, 0, 0)).toThrow(ERROR_MESSAGE.VALIDATION_ERROR)
    })

    it('should throw validation error for negative creditCount', () => {
      // Arrange
      const tile = createMockTile()

      // Act & Assert
      expect(() => calculateScore(tile, -1, 0)).toThrow(ERROR_MESSAGE.VALIDATION_ERROR)
    })

    it('should throw validation error for negative saveCount', () => {
      // Arrange
      const tile = createMockTile()

      // Act & Assert
      expect(() => calculateScore(tile, 0, -1)).toThrow(ERROR_MESSAGE.VALIDATION_ERROR)
    })
  })

  describe('combined edge cases', () => {
    it('should handle tile with all quality components at maximum', () => {
      // Arrange
      const tile = createMockTile({
        createdAt: new Date(),
        title: 'Test Title',
        description: 'Test Description',
      })

      // Act
      const score = calculateScore(tile, QUALITY.MAX_NUM_CREDITS, 100)

      // Assert
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(1)
      expect(score).toBeCloseTo(1, 6) // use closeTo to avoid floating point precision issues
    })

    it('should return normalized score rounded to 9 decimal places', () => {
      // Arrange
      const tile = createMockTile()

      // Act
      const score = calculateScore(tile, 3, 14)

      // Assert
      // Check that score is rounded to 9 decimal places
      const decimalPlaces = score.toString().split('.')[1]?.length || 0
      expect(decimalPlaces).toBeLessThanOrEqual(9)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    })
  })
})
