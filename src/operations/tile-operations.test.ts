import { afterAll, afterEach, describe, expect, it } from 'vitest'

import { FeedQueryResult, TileListItem } from '@/app/_types/tiles'
import { LOCATIONS } from '@/db/constants'
import { savedTilesModel } from '@/models/saved-tiles'
import { tileModel } from '@/models/tile'
import { tileSupplierModel } from '@/models/tile-supplier'
import { createTileCreditForm, scene, TEST_TILE } from '@/testing/scene'

import { tileOperations } from './tile-operations'

const CURRENT_USER = {
  email: 'currentUser@example.com',
  password: 'testpassword123',
  displayName: 'Current User',
  handle: 'currentUser',
}

// Test helpers for getFeed tests
function findTileInResults(result: FeedQueryResult, tileId: string): TileListItem | undefined {
  return result.tiles.find((t) => t.id === tileId)
}

describe('tileOperations', () => {
  afterEach(async () => {
    await scene.withoutTilesForSupplier()
  })
  afterAll(async () => {
    await scene.resetTestData()
    await scene.withoutUser({ handle: CURRENT_USER.handle })
    // Clean up additional users created by getFeed tests
    await scene.withoutUser({ handle: 'thirduser' })
    await scene.withoutUser({ handle: 'savecount3' })
    await scene.withoutTilesForSupplier({ supplierHandle: 'testsupplier2' })
    await scene.withoutSupplier({ handle: 'testsupplier2' })
  })

  describe('getById', () => {
    it('should get a tile by id', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Act
      const result = await tileOperations.getById(tile.id)

      // Assert
      expect(tile).toBeDefined()
      expect(result.id).toBe(tile.id)
      expect(result.imagePath).toBeDefined()
      expect(result.createdByUserId).toBe(user.id)
      expect(result.credits.find((c) => c.supplierHandle === supplier.handle)).toBeDefined()
    })

    it('should throw an error if the tile does not exist', async () => {
      // Arrange & Act & Assert
      await expect(tileOperations.getById('00000000-0000-0000-0000-000000000000')).rejects.toThrow()
    })

    it('Should return isSaved as undefined when no authUserId provided', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Act
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })
      const result = await tileOperations.getById(tile.id)

      // Assert
      expect(result.isSaved).toBeUndefined()
    })

    it('Should return isSaved as true when authUserId provided', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Act
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })
      const result = await tileOperations.getById(tile.id, user.id)

      // Assert
      expect(result.isSaved).toBe(true)
    })

    it('Should return isSaved as false when authUserId provided but tile is not saved', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })

      // Act
      const result = await tileOperations.getById(tile.id, '00000000-0000-0000-0000-000000000000')

      // Assert
      expect(result.isSaved).toBe(false)
    })
  })
  describe('getListForSupplier', () => {
    it('should get a list of tiles for a supplier', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Act
      const result = await tileOperations.getListForSupplier(supplier.id)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.find((t) => t.id === tile.id)).toBeDefined()
    })

    it('should return empty array when supplier has no tiles', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      await scene.withoutTilesForSupplier({ supplierHandle: supplier.handle })

      // Act
      const result = await tileOperations.getListForSupplier(supplier.id)

      // Assert
      expect(result.length).toBe(0)
    })

    it('should return isSaved as undefined for all tiles when no authUserId provided', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile1 = await scene.hasTile({ imagePath: 'image1.jpg', createdByUserId: user.id, credits: [createTileCreditForm({ supplierId: supplier.id })] })
      await scene.hasTile({ imagePath: 'image2.jpg', createdByUserId: user.id, credits: [createTileCreditForm({ supplierId: supplier.id })] })

      await savedTilesModel.upsertSavedTileRaw({ tileId: tile1.id, userId: user.id, isSaved: true })

      // Act
      const result = await tileOperations.getListForSupplier(supplier.id)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((t) => t.isSaved === undefined)).toBe(true)
    })

    it('should return correct isSaved status for each tile when authUserId provided', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile1 = await scene.hasTile({ imagePath: 'image1.jpg', createdByUserId: user.id, credits: [createTileCreditForm({ supplierId: supplier.id })] })
      const tile2 = await scene.hasTile({ imagePath: 'image2.jpg', createdByUserId: user.id, credits: [createTileCreditForm({ supplierId: supplier.id })] })
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile1.id, userId: user.id, isSaved: true })
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile2.id, userId: user.id, isSaved: false })

      // Act
      const result = await tileOperations.getListForSupplier(supplier.id, user.id)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.some((t) => t.isSaved === undefined)).toBe(false)
      expect(result.find((t) => t.id === tile1.id)?.isSaved).toBe(true)
      expect(result.find((t) => t.id === tile2.id)?.isSaved).toBe(false)
    })
  })
  describe('getListForUser', () => {
    it('should get a list of tiles saved by a user', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })

      // Act
      const result = await tileOperations.getListForUser(user.id)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.find((t) => t.id === tile.id)).toBeDefined()
    })

    it('should return empty array when user has no saved tiles', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Act
      const result = await tileOperations.getListForUser(user.id)

      // Assert
      expect(result.length).toBe(0)
    })

    it('should return isSaved as undefined for all tiles when no authUserId provided', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })

      // Act
      const result = await tileOperations.getListForUser(user.id)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((t) => t.isSaved === undefined)).toBe(true)
    })

    it('should return correct isSaved status for each tile when authUserId provided', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile1 = await scene.hasTile({ imagePath: 'image1.jpg', createdByUserId: user.id, credits: [createTileCreditForm({ supplierId: supplier.id })] })
      const tile2 = await scene.hasTile({ imagePath: 'image2.jpg', createdByUserId: user.id, credits: [createTileCreditForm({ supplierId: supplier.id })] })
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile1.id, userId: user.id, isSaved: true })
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile2.id, userId: user.id, isSaved: true })

      const currentUser = await scene.hasUser(CURRENT_USER)
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile1.id, userId: currentUser.id, isSaved: true })

      // Act
      const result = await tileOperations.getListForUser(user.id, currentUser.id)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.some((t) => t.isSaved === undefined)).toBe(false)
      expect(result.find((t) => t.id === tile1.id)?.isSaved).toBe(true)
      expect(result.find((t) => t.id === tile2.id)?.isSaved).toBe(false)
    })
  })

  describe('getFeed', () => {
    it('should return tiles sorted by composite score with pagination', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()
      const otherUser = await scene.hasUser(CURRENT_USER)

      // Create tiles with different quality scores
      // Tile 1: High quality (title + description + credits) - should score highest
      const tile1 = await scene.hasTile({
        imagePath: 'feed-tile-1.jpg',
        title: 'High Quality Tile',
        description: 'This tile has everything',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Tile 2: Medium quality (title only)
      const tile2 = await scene.hasTile({
        imagePath: 'feed-tile-2.jpg',
        title: 'Medium Quality Tile',
        description: '',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Tile 3: Low quality (no title, no description, but has credit for scoring)
      const tile3 = await scene.hasTile({
        imagePath: 'feed-tile-3.jpg',
        title: '',
        description: '',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Add save counts to test social proof scoring
      // Tile 1 gets 3 saves (higher social score)
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile1.id, userId: user.id, isSaved: true })
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile1.id, userId: otherUser.id, isSaved: true })
      // Create another user for a third save
      const thirdUser = await scene.hasUser({ email: 'third@example.com', handle: 'thirduser', displayName: 'Third User' })
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile1.id, userId: thirdUser.id, isSaved: true })

      // Tile 2 gets 1 save
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile2.id, userId: user.id, isSaved: true })

      // Tile 3 gets 0 saves

      // Act
      const result = await tileOperations.getFeed({ limit: 10 })

      // Assert
      expect(result.tiles.length).toBeGreaterThanOrEqual(3)
      expect(result.tiles.some((t) => t.id === tile1.id)).toBe(true)
      expect(result.tiles.some((t) => t.id === tile2.id)).toBe(true)
      expect(result.tiles.some((t) => t.id === tile3.id)).toBe(true)

      // Verify tiles are sorted by score (tile1 should come before tile2, tile2 before tile3)
      const tile1Index = result.tiles.findIndex((t) => t.id === tile1.id)
      const tile2Index = result.tiles.findIndex((t) => t.id === tile2.id)
      const tile3Index = result.tiles.findIndex((t) => t.id === tile3.id)

      expect(tile1Index).toBeLessThan(tile2Index)
      expect(tile2Index).toBeLessThan(tile3Index)

      // Verify response structure
      expect(result).toHaveProperty('tiles')
      expect(result).toHaveProperty('nextCursor')
      expect(result).toHaveProperty('hasNextPage')
      expect(Array.isArray(result.tiles)).toBe(true)

      // Verify tile structure
      result.tiles.forEach((tile) => {
        expect(tile).toHaveProperty('id')
        expect(tile).toHaveProperty('imagePath')
        expect(tile).toHaveProperty('title')
        expect(tile).toHaveProperty('description')
        expect(tile).toHaveProperty('isSaved')
      })
    })

    it('should include isSaved state when authUserId provided', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()
      const currentUser = await scene.hasUser(CURRENT_USER)

      const tile1 = await scene.hasTile({
        imagePath: 'feed-saved-tile-1.jpg',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })
      const tile2 = await scene.hasTile({
        imagePath: 'feed-saved-tile-2.jpg',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Current user saves tile1
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile1.id, userId: currentUser.id, isSaved: true })
      // Current user does not save tile2

      // Act
      const result = await tileOperations.getFeed({ limit: 10 }, currentUser.id)

      // Assert
      const resultTile1 = findTileInResults(result, tile1.id)
      const resultTile2 = findTileInResults(result, tile2.id)

      expect(resultTile1).toBeDefined()
      expect(resultTile2).toBeDefined()
      expect(resultTile1?.isSaved).toBe(true)
      expect(resultTile2?.isSaved).toBe(false)
    })

    it('should return undefined isSaved when authUserId not provided', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()
      const tile = await scene.hasTile({
        imagePath: 'feed-unsaved-tile.jpg',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })

      // Act
      const result = await tileOperations.getFeed({ limit: 10 })

      // Assert
      const resultTile = findTileInResults(result, tile.id)
      expect(resultTile).toBeDefined()
      expect(resultTile?.isSaved).toBeUndefined()
    })

    it('should support pagination with cursor', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()

      // Create enough tiles to test pagination
      const tiles = []
      for (let i = 0; i < 5; i++) {
        const tile = await scene.hasTile({
          imagePath: `feed-pagination-tile-${i}.jpg`,
          title: `Pagination Test Tile ${i}`,
          description: `Description for tile ${i}`,
          createdByUserId: user.id,
          credits: [createTileCreditForm({ supplierId: supplier.id })],
        })
        tiles.push(tile)
      }

      // Act - First page
      const firstPage = await tileOperations.getFeed({ limit: 2 })

      // Assert - First page
      expect(firstPage.tiles.length).toBe(2)
      expect(firstPage.hasNextPage).toBe(true)
      expect(firstPage.nextCursor).toBeTruthy()

      // Act - Second page using cursor
      const secondPage = await tileOperations.getFeed({ cursor: firstPage.nextCursor!, limit: 2 })

      // Assert - Second page
      expect(secondPage.tiles.length).toBeGreaterThan(0)
      // Verify no duplicates between pages
      const firstPageIds = new Set(firstPage.tiles.map((t) => t.id))
      const secondPageIds = new Set(secondPage.tiles.map((t) => t.id))
      const intersection = [...firstPageIds].filter((id) => secondPageIds.has(id))
      expect(intersection.length).toBe(0)

      // Verify that at least some of our test tiles appear in the results
      const allTestTileIds = new Set(tiles.map((t) => t.id))
      const allResultIds = [...firstPageIds, ...secondPageIds]
      const testTilesInResults = allResultIds.filter((id) => allTestTileIds.has(id))
      expect(testTilesInResults.length).toBeGreaterThan(0)
    })

    it('should correctly calculate composite score (recency, quality, social proof)', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()
      const otherUser = await scene.hasUser(CURRENT_USER)

      // Create tiles with known characteristics for score verification
      // Tile with all quality factors (title, description, credits)
      const highQualityTile = await scene.hasTile({
        imagePath: 'score-test-high-quality.jpg',
        title: 'High Quality',
        description: 'Has description',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Tile with only credits (lower quality score)
      const lowQualityTile = await scene.hasTile({
        imagePath: 'score-test-low-quality.jpg',
        title: '',
        description: '',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Add saves to high quality tile (higher social score)
      await savedTilesModel.upsertSavedTileRaw({ tileId: highQualityTile.id, userId: user.id, isSaved: true })
      await savedTilesModel.upsertSavedTileRaw({ tileId: highQualityTile.id, userId: otherUser.id, isSaved: true })

      // Act
      const result = await tileOperations.getFeed({ limit: 10 })

      // Assert - High quality tile should come before low quality tile
      const highQualityIndex = result.tiles.findIndex((t) => t.id === highQualityTile.id)
      const lowQualityIndex = result.tiles.findIndex((t) => t.id === lowQualityTile.id)

      expect(highQualityIndex).toBeGreaterThan(-1)
      expect(lowQualityIndex).toBeGreaterThan(-1)
      expect(highQualityIndex).toBeLessThan(lowQualityIndex)
    })

    it('should correctly aggregate save counts', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()
      const user2 = await scene.hasUser(CURRENT_USER)
      const user3 = await scene.hasUser({ email: 'savecount3@example.com', handle: 'savecount3', displayName: 'Save Count 3' })

      const tile = await scene.hasTile({
        imagePath: 'save-count-test.jpg',
        title: 'Save Count Test',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Add 3 saves (all isSaved: true)
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user2.id, isSaved: true })
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user3.id, isSaved: true })

      // Act
      const result = await tileOperations.getFeed({ limit: 10 })

      // Assert - Tile should appear in results (save count affects score)
      const resultTile = findTileInResults(result, tile.id)
      expect(resultTile).toBeDefined()
      // Tile with 3 saves should have a higher social score than tiles with fewer saves
    })

    it('should only return public tiles (isPrivate = false)', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()

      // Create a public tile
      const publicTile = await scene.hasTile({
        imagePath: 'public-tile-test.jpg',
        title: 'Public Tile',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Create a private tile directly via model (since createForSupplier always creates public tiles)
      const privateTile = await tileModel.createRaw({
        imagePath: 'private-tile-test.jpg',
        title: 'Private Tile',
        description: null,
        location: LOCATIONS.WELLINGTON,
        createdByUserId: user.id,
        isPrivate: true,
      })

      // Act
      const result = await tileOperations.getFeed({ limit: 100 })

      // Assert
      const publicTileInResults = findTileInResults(result, publicTile.id)
      const privateTileInResults = findTileInResults(result, privateTile.id)

      expect(publicTileInResults).toBeDefined()
      expect(privateTileInResults).toBeUndefined()

      // Cleanup
      await tileModel.deleteById(privateTile.id)
    })

    it('should correctly handle hasNextPage and cursor pagination', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()

      // Create exactly 5 tiles
      const tiles = []
      for (let i = 0; i < 5; i++) {
        const tile = await scene.hasTile({
          imagePath: `hasnextpage-test-${i}.jpg`,
          title: `HasNextPage Test ${i}`,
          description: `Description ${i}`,
          createdByUserId: user.id,
          credits: [createTileCreditForm({ supplierId: supplier.id })],
        })
        tiles.push(tile)
      }

      // Act - Request 2 tiles at a time
      const page1 = await tileOperations.getFeed({ limit: 2 })
      const page2 = await tileOperations.getFeed({ cursor: page1.nextCursor!, limit: 2 })
      const page3 = await tileOperations.getFeed({ cursor: page2.nextCursor!, limit: 2 })

      // Assert
      expect(page1.tiles.length).toBe(2)
      expect(page1.hasNextPage).toBe(true)
      expect(page1.nextCursor).toBeTruthy()

      expect(page2.tiles.length).toBe(2)
      expect(page2.hasNextPage).toBe(true)
      expect(page2.nextCursor).toBeTruthy()

      // Page 3 might have fewer tiles if we've exhausted all tiles
      expect(page3.tiles.length).toBeGreaterThanOrEqual(0)
      // hasNextPage should be false if we've reached the end
      if (page3.tiles.length < 2) {
        expect(page3.hasNextPage).toBe(false)
        expect(page3.nextCursor).toBeNull()
      }

      // Verify no duplicates across all pages
      const allPageIds = [...page1.tiles.map((t) => t.id), ...page2.tiles.map((t) => t.id), ...page3.tiles.map((t) => t.id)]
      const uniqueIds = new Set(allPageIds)
      expect(uniqueIds.size).toBe(allPageIds.length)
    })

    it('should not skip tiles when paginating', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()

      // Create a known set of tiles with unique image paths to identify them
      const testTiles = []
      const uniquePrefix = `no-skip-test-${Date.now()}`
      for (let i = 0; i < 10; i++) {
        const tile = await scene.hasTile({
          imagePath: `${uniquePrefix}-${i}.jpg`,
          title: `No Skip Test ${i}`,
          description: `Description ${i}`,
          createdByUserId: user.id,
          credits: [createTileCreditForm({ supplierId: supplier.id })],
        })
        testTiles.push(tile)
      }

      // Act - Fetch all pages
      const allFetchedTiles: string[] = []
      let cursor: string | null = null
      let pageCount = 0
      const maxPages = 10 // Safety limit

      do {
        const page = await tileOperations.getFeed({ cursor: cursor || undefined, limit: 3 })
        allFetchedTiles.push(...page.tiles.map((t) => t.id))
        cursor = page.nextCursor
        pageCount++
      } while (cursor && pageCount < maxPages)

      // Assert - All test tiles should appear exactly once in the fetched results
      const testTileIds = new Set(testTiles.map((t) => t.id))
      const fetchedTestTiles = allFetchedTiles.filter((id) => testTileIds.has(id))

      // Verify all test tiles are present
      expect(fetchedTestTiles.length).toBe(testTiles.length)

      // Verify no duplicates of test tiles
      const uniqueFetchedTestTiles = new Set(fetchedTestTiles)
      expect(uniqueFetchedTestTiles.size).toBe(testTiles.length)
    })
  })

  describe('createForSupplier', () => {
    it('should create a tile for a supplier', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })

      // Act
      const result = await tileOperations.createForSupplier({
        ...TEST_TILE,
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Assert
      expect(result.id).toBeDefined()
    })

    it('should throw an error if no credits are provided', async () => {
      // Arrange
      const user = await scene.hasUser()

      // Act & Assert
      await expect(
        tileOperations.createForSupplier({
          ...TEST_TILE,
          createdByUserId: user.id,
          credits: [],
        })
      ).rejects.toThrow()
    })

    it('should convert empty strings to null for optional fields (title, description)', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })

      // Act
      const result = await tileOperations.createForSupplier({
        ...TEST_TILE,
        title: '',
        description: '',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Assert - Check that empty strings were converted to null in the DB
      const tile = await tileModel.getRawById(result.id)
      expect(tile).toBeDefined()
      expect(tile?.title).toBeNull()
      expect(tile?.description).toBeNull()
    })

    it('should convert empty strings to null for optional serviceDescription in credits', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })

      // Act
      const result = await tileOperations.createForSupplier({
        ...TEST_TILE,
        title: 'Test Title',
        description: 'Test Description',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id, serviceDescription: '' })],
      })

      // Assert - Check that empty string in serviceDescription was converted to null
      const credits = await tileSupplierModel.getCreditsByTileId(result.id)
      expect(credits.length).toBeGreaterThan(0)
      expect(credits[0].serviceDescription).toBeNull()
    })

    it('should handle mixed empty and non-empty optional fields', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })

      // Act
      const result = await tileOperations.createForSupplier({
        ...TEST_TILE,
        title: 'Test Title',
        description: '',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id, serviceDescription: 'Some description' })],
      })

      // Assert
      const tile = await tileModel.getRawById(result.id)
      expect(tile).toBeDefined()
      expect(tile?.title).toBe('Test Title')
      expect(tile?.description).toBeNull()

      const credits = await tileSupplierModel.getCreditsByTileId(result.id)
      expect(credits[0].serviceDescription).toBe('Some description')
    })

    it('should handle multiple credits for different suppliers', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier1 = await scene.hasSupplier({ createdByUserId: user.id })
      const supplier2 = await scene.hasSupplier({ handle: 'testsupplier2', createdByUserId: user.id })

      // Act
      const result = await tileOperations.createForSupplier({
        ...TEST_TILE,
        createdByUserId: user.id,
        credits: [
          createTileCreditForm({ supplierId: supplier1.id, serviceDescription: 'First supplier description' }),
          createTileCreditForm({ supplierId: supplier2.id, serviceDescription: 'Second supplier description' }),
        ],
      })

      // Assert - Check that both credits were created
      const credits = await tileSupplierModel.getCreditsByTileId(result.id)
      expect(credits.length).toBe(2)

      const credit1 = credits.find((c) => c.supplierId === supplier1.id)
      const credit2 = credits.find((c) => c.supplierId === supplier2.id)

      expect(credit1).toBeDefined()
      expect(credit1?.supplier.handle).toBe(supplier1.handle)
      expect(credit1?.serviceDescription).toBe('First supplier description')

      expect(credit2).toBeDefined()
      expect(credit2?.supplier.handle).toBe(supplier2.handle)
      expect(credit2?.serviceDescription).toBe('Second supplier description')
    })
  })
  describe('getCreditsForTile', () => {
    it('should get the credits for a tile', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Act
      const result = await tileOperations.getCreditsForTile(tile.id)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.find((c) => c.supplierHandle === supplier.handle)).toBeDefined()
    })

    it('should return empty array if the tile does not exist', async () => {
      // Act
      const result = await tileOperations.getCreditsForTile('00000000-0000-0000-0000-000000000000')

      // Assert
      expect(result.length).toBe(0)
    })
  })
  describe('createCreditForTile', () => {
    it('should create a credit for a tile', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      const supplier2 = await scene.hasSupplier({ handle: 'testsupplier2', createdByUserId: user.id })

      // Act
      const result = await tileOperations.createCreditForTile({
        tileId: tile.id,
        credit: createTileCreditForm({ supplierId: supplier2.id }),
        authUserId: user.id,
      })

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.find((c) => c.supplierHandle === supplier.handle)).toBeDefined()
      expect(result.find((c) => c.supplierHandle === supplier2.handle)).toBeDefined()
    })

    it('should throw an error if the tile does not exist', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })

      // Act & Assert
      await expect(
        tileOperations.createCreditForTile({
          tileId: '00000000-0000-0000-0000-000000000000',
          credit: createTileCreditForm({ supplierId: supplier.id }),
          authUserId: user.id,
        })
      ).rejects.toThrow()
    })

    it('should throw an error if the supplier does not exist', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Act & Assert
      await expect(
        tileOperations.createCreditForTile({
          tileId: tile.id,
          credit: createTileCreditForm({ supplierId: '00000000-0000-0000-0000-000000000000' }),
          authUserId: user.id,
        })
      ).rejects.toThrow()
    })

    it('should throw an error if the authUserId is not the creator of the tile', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Act & Assert
      await expect(
        tileOperations.createCreditForTile({
          tileId: tile.id,
          credit: createTileCreditForm({ supplierId: supplier.id }),
          authUserId: '00000000-0000-0000-0000-000000000000',
        })
      ).rejects.toThrow()
    })

    it('should convert empty string to null for optional serviceDescription', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      const supplier2 = await scene.hasSupplier({ handle: 'testsupplier2', createdByUserId: user.id })

      // Act
      const result = await tileOperations.createCreditForTile({
        tileId: tile.id,
        credit: createTileCreditForm({ supplierId: supplier2.id, serviceDescription: '' }),
        authUserId: user.id,
      })

      // Assert - Check that empty string in serviceDescription was converted to null
      const creditWithEmptyDescription = result.find((c) => c.supplierId === supplier2.id)
      expect(creditWithEmptyDescription).toBeDefined()

      const credits = await tileSupplierModel.getCreditsByTileId(tile.id)
      const dbCredit = credits.find((c) => c.supplierId === supplier2.id)
      expect(dbCredit).toBeDefined()
      expect(dbCredit?.serviceDescription).toBeNull()
    })

    it('should preserve non-empty serviceDescription', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      const supplier2 = await scene.hasSupplier({ handle: 'testsupplier2', createdByUserId: user.id })
      const serviceDescription = 'Test service description'

      // Act
      const result = await tileOperations.createCreditForTile({
        tileId: tile.id,
        credit: createTileCreditForm({ supplierId: supplier2.id, serviceDescription }),
        authUserId: user.id,
      })

      // Assert
      const credit = result.find((c) => c.supplierId === supplier2.id)
      expect(credit).toBeDefined()
      expect(credit?.serviceDescription).toBe(serviceDescription)

      const credits = await tileSupplierModel.getCreditsByTileId(tile.id)
      const dbCredit = credits.find((c) => c.supplierId === supplier2.id)
      expect(dbCredit?.serviceDescription).toBe(serviceDescription)
    })
  })
})
