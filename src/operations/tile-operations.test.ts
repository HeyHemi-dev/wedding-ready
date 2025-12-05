import { afterAll, afterEach, describe, expect, it } from 'vitest'

import { FeedQueryResult, TileListItem } from '@/app/_types/tiles'
import { LOCATIONS } from '@/db/constants'
import { savedTilesModel } from '@/models/saved-tiles'
import { tileModel } from '@/models/tile'
import { tileSupplierModel } from '@/models/tile-supplier'
import { createTileCreditForm, scene, TEST_TILE, TEST_ID_0 } from '@/testing/scene'

import { tileOperations } from './tile-operations'

const CURRENT_USER = {
  email: 'currentUser@example.com',
  password: 'testpassword123',
  displayName: 'Current User',
  handle: 'currentUser',
}

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
      const { user, supplier, tile } = await scene.hasUserSupplierAndTile()

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
      await expect(tileOperations.getById(TEST_ID_0)).rejects.toThrow()
    })

    it('Should return isSaved as undefined when no authUserId provided', async () => {
      // Arrange
      const { user, tile } = await scene.hasUserSupplierAndTile()

      // Act
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })
      const result = await tileOperations.getById(tile.id)

      // Assert
      expect(result.isSaved).toBeUndefined()
    })

    it('Should return isSaved as true when authUserId provided', async () => {
      // Arrange
      const { user, tile } = await scene.hasUserSupplierAndTile()

      // Act
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })
      const result = await tileOperations.getById(tile.id, user.id)

      // Assert
      expect(result.isSaved).toBe(true)
    })

    it('Should return isSaved as false when authUserId provided but tile is not saved', async () => {
      // Arrange
      const { user, tile } = await scene.hasUserSupplierAndTile()

      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })

      // Act
      const result = await tileOperations.getById(tile.id, TEST_ID_0)

      // Assert
      expect(result.isSaved).toBe(false)
    })
  })
  describe('getListForSupplier', () => {
    it('should get a list of tiles for a supplier', async () => {
      // Arrange
      const { supplier, tile } = await scene.hasUserSupplierAndTile()

      // Act
      const result = await tileOperations.getListForSupplier(supplier.id)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.find((t) => t.id === tile.id)).toBeDefined()
    })

    it('should return empty array when supplier has no tiles', async () => {
      // Arrange
      const { supplier } = await scene.hasUserAndSupplier()
      await scene.withoutTilesForSupplier({ supplierHandle: supplier.handle })

      // Act
      const result = await tileOperations.getListForSupplier(supplier.id)

      // Assert
      expect(result.length).toBe(0)
    })

    it('should return isSaved as undefined for all tiles when no authUserId provided', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()
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
      const { user, supplier } = await scene.hasUserAndSupplier()
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
      const { user, tile } = await scene.hasUserSupplierAndTile()

      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })

      // Act
      const result = await tileOperations.getListForUser(user.id)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.find((t) => t.id === tile.id)).toBeDefined()
    })

    it('should return empty array when user has no saved tiles', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()
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
      const { user, tile } = await scene.hasUserSupplierAndTile()

      await savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })

      // Act
      const result = await tileOperations.getListForUser(user.id)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((t) => t.isSaved === undefined)).toBe(true)
    })

    it('should return correct isSaved status for each tile when authUserId provided', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()
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
    it('should not return duplicate tiles across pages', async () => {
      // Arrange - Paginate through multiple pages
      const seensTileIds = new Map<string, { onPageCount: number; atPosition: number }>()
      let cursor: string | null = null
      let pageCount = 0
      const maxPages = 50 // Safety limit to prevent infinite loops
      const pageSize = 10

      // Act - Fetch multiple pages
      do {
        const page = await tileOperations.getFeed({ cursor: cursor || undefined, limit: pageSize })

        // Track all tiles seen across pages
        page.tiles.forEach((tile, index) => {
          if (seensTileIds.has(tile.id)) {
            const firstSeen = seensTileIds.get(tile.id)!
            console.log({
              tileId: tile.id,
              firstSeen,
              currentSeen: {
                onPageCount: pageCount,
                atPosition: index,
              },
            })
            throw new Error('Duplicate tile found')
          }
          seensTileIds.set(tile.id, { onPageCount: pageCount, atPosition: index })
        })

        cursor = page.nextCursor
        pageCount++

        // Stop if we've reached the end
        if (!page.hasNextPage || !cursor) break
      } while (pageCount < maxPages)

      // Assert - No duplicates should have been found (error would have been thrown above)
      expect(seensTileIds.size).toBeGreaterThan(0)
    })

    it('should correctly indicate hasNextPage', async () => {
      // Arrange
      const pageSize = 5

      // Act - Fetch first page
      const page1 = await tileOperations.getFeed({ limit: pageSize })

      // Assert - hasNextPage should be true if we got a full page, false otherwise
      if (page1.tiles.length === pageSize) {
        expect(page1.hasNextPage).toBe(true)
        expect(page1.nextCursor).toBeTruthy()

        // Fetch next page to verify cursor works
        const page2 = await tileOperations.getFeed({ cursor: page1.nextCursor!, limit: pageSize })
        expect(page2.tiles.length).toBeGreaterThanOrEqual(0)

        // If page2 has fewer tiles than pageSize, it should be the last page
        if (page2.tiles.length < pageSize) {
          expect(page2.hasNextPage).toBe(false)
          expect(page2.nextCursor).toBeNull()
        }
      } else {
        // If first page has fewer tiles than requested, it's the last page
        expect(page1.hasNextPage).toBe(false)
        expect(page1.nextCursor).toBeNull()
      }
    })

    it('should only return public tiles (isPrivate = false)', async () => {
      // Arrange - Create a private tile directly via model
      const { user } = await scene.hasUserAndSupplier()
      const privateTile = await tileModel.createRaw({
        imagePath: 'private-tile-test.jpg',
        title: 'Private Tile',
        description: null,
        location: LOCATIONS.WELLINGTON,
        createdByUserId: user.id,
        isPrivate: true,
      })

      // Act - Fetch feed and verify none of the returned tiles are private
      const result = await tileOperations.getFeed({ limit: 100 })

      // Assert - Verify none of the returned tiles are private by checking each one
      for (const tile of result.tiles) {
        const tileRaw = await tileModel.getRawById(tile.id)
        expect(tileRaw).toBeDefined()
        expect(tileRaw?.isPrivate).toBe(false)
      }

      // Cleanup
      await tileModel.deleteById(privateTile.id)
    })

    it('should return correct isSaved state when authUserId provided', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()
      const currentUser = await scene.hasUser(CURRENT_USER)

      // Create tiles and set up save states
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

      // Current user saves tile1, does not save tile2
      await savedTilesModel.upsertSavedTileRaw({ tileId: tile1.id, userId: currentUser.id, isSaved: true })

      // Act - Fetch feed with authUserId
      const result = await tileOperations.getFeed({ limit: 100 }, currentUser.id)

      // Assert - Verify isSaved states match actual save states
      for (const tile of result.tiles) {
        const savedTile = await savedTilesModel.getSavedTileRaw(tile.id, currentUser.id)
        const expectedIsSaved = savedTile?.isSaved ?? false
        expect(tile.isSaved).toBe(expectedIsSaved)
      }
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

      // Act - Fetch feed without authUserId
      const result = await tileOperations.getFeed({ limit: 100 })

      // Assert - All tiles should have undefined isSaved
      result.tiles.forEach((tile) => {
        expect(tile.isSaved).toBeUndefined()
      })
    })
  })

  describe('createForSupplier', () => {
    it('should create a tile for a supplier', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()

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
      const { user, supplier } = await scene.hasUserAndSupplier()

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
      const { user, supplier } = await scene.hasUserAndSupplier()

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
      const { user, supplier } = await scene.hasUserAndSupplier()

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
      const { supplier, tile } = await scene.hasUserSupplierAndTile()

      // Act
      const result = await tileOperations.getCreditsForTile(tile.id)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.find((c) => c.supplierHandle === supplier.handle)).toBeDefined()
    })

    it('should return empty array if the tile does not exist', async () => {
      // Act
      const result = await tileOperations.getCreditsForTile(TEST_ID_0)

      // Assert
      expect(result.length).toBe(0)
    })
  })
  describe('createCreditForTile', () => {
    it('should create a credit for a tile', async () => {
      // Arrange
      const { user, supplier, tile } = await scene.hasUserSupplierAndTile()

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
      const { user, supplier } = await scene.hasUserAndSupplier()

      // Act & Assert
      await expect(
        tileOperations.createCreditForTile({
          tileId: TEST_ID_0,
          credit: createTileCreditForm({ supplierId: supplier.id }),
          authUserId: user.id,
        })
      ).rejects.toThrow()
    })

    it('should throw an error if the supplier does not exist', async () => {
      // Arrange
      const { user, tile } = await scene.hasUserSupplierAndTile()

      // Act & Assert
      await expect(
        tileOperations.createCreditForTile({
          tileId: tile.id,
          credit: createTileCreditForm({ supplierId: TEST_ID_0 }),
          authUserId: user.id,
        })
      ).rejects.toThrow()
    })

    it('should throw an error if the authUserId is not the creator of the tile', async () => {
      // Arrange
      const { supplier, tile } = await scene.hasUserSupplierAndTile()

      // Act & Assert
      await expect(
        tileOperations.createCreditForTile({
          tileId: tile.id,
          credit: createTileCreditForm({ supplierId: supplier.id }),
          authUserId: TEST_ID_0,
        })
      ).rejects.toThrow()
    })

    it('should convert empty string to null for optional serviceDescription', async () => {
      // Arrange
      const { user, tile } = await scene.hasUserSupplierAndTile()

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
      const { user, tile } = await scene.hasUserSupplierAndTile()

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
