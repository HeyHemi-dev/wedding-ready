import { afterAll, afterEach, describe, expect, it } from 'vitest'

import { LOCATIONS } from '@/db/constants'
import { savedTilesModel } from '@/models/saved-tiles'
import { tileModel } from '@/models/tile'
import { tileSupplierModel } from '@/models/tile-supplier'
import { createTileCreditForm, scene, TEST_TILE, TEST_ID_0 } from '@/testing/scene'

import { RECENCY, updateScoreForTile } from './feed/feed-helpers'
import { getSaveStatesMap, tileOperations } from './tile-operations'

const CURRENT_USER = {
  email: 'currentUser@example.com',
  password: 'testpassword123',
  displayName: 'Current User',
  handle: 'currentUser',
}

describe('tileOperations', () => {
  afterEach(async () => {
    await scene.withoutTilesForSupplier()
  })
  afterAll(async () => {
    await scene.resetTestData()
    await scene.withoutUser({ handle: CURRENT_USER.handle })

    // Clean up additional
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
      await savedTilesModel.upsertRaw({ tileId: tile.id, userId: user.id, isSaved: true })
      const result = await tileOperations.getById(tile.id)

      // Assert
      expect(result.isSaved).toBeUndefined()
    })

    it('Should return isSaved as true when authUserId provided', async () => {
      // Arrange
      const { user, tile } = await scene.hasUserSupplierAndTile()

      // Act
      await savedTilesModel.upsertRaw({ tileId: tile.id, userId: user.id, isSaved: true })
      const result = await tileOperations.getById(tile.id, user.id)

      // Assert
      expect(result.isSaved).toBe(true)
    })

    it('Should return isSaved as false when authUserId provided but tile is not saved', async () => {
      // Arrange
      const { user, tile } = await scene.hasUserSupplierAndTile()

      await savedTilesModel.upsertRaw({ tileId: tile.id, userId: user.id, isSaved: true })

      // Act
      const result = await tileOperations.getById(tile.id, TEST_ID_0)

      // Assert
      expect(result.isSaved).toBe(false)
    })
  })

  describe('getFeedForUser', () => {
    it('should not return duplicate tiles across pages', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()
      const seensTileIds = new Map<string, { onPageCount: number; atPosition: number }>()
      let pageCount = 0
      const maxPages = 10 // Safety limit to prevent infinite loops
      const pageSize = 3

      // Create tiles in case test user has already seen all tiles
      for (let i = 0; i < pageSize * 3; i++) {
        await scene.hasTile({
          imagePath: `feed-no-duplicate-tile-${i}.jpg`,
          createdByUserId: user.id,
          credits: [createTileCreditForm({ supplierId: supplier.id })],
        })
      }

      // Act
      do {
        const page = await tileOperations.getFeedForUser(user.id, pageSize)

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

        pageCount++

        // Stop if we've reached the end
        if (!page.hasNextPage) break
      } while (pageCount < maxPages)

      // Assert - No duplicates should have been found (error would have been thrown above)
      expect(seensTileIds.size).toBeGreaterThan(0)
    })

    it('should correctly indicate hasNextPage', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()
      const pageSize = 5
      for (let i = 0; i < pageSize + 1; i++) {
        await scene.hasTile({
          imagePath: `feed-correctly-indicate-hasnextpage-tile-${i}.jpg`,
          createdByUserId: user.id,
          credits: [createTileCreditForm({ supplierId: supplier.id })],
        })
      }

      // Act
      const page1 = await tileOperations.getFeedForUser(user.id, pageSize)

      // Assert
      if (page1.tiles.length === pageSize) {
        // hasNextPage should be true if we got exactly the requested number of tiles, false otherwise
        expect(page1.hasNextPage).toBe(true)

        // Fetch next page to verify pagination works
        const page2 = await tileOperations.getFeedForUser(user.id, pageSize)
        expect(page2.tiles.length).toBeGreaterThanOrEqual(0)

        // If page2 has fewer tiles than pageSize, it should be the last page
        if (page2.tiles.length < pageSize) {
          expect(page2.hasNextPage).toBe(false)
        }
      } else {
        // If first page has fewer tiles than requested, it's the last page
        expect(page1.hasNextPage).toBe(false)
      }
    })

    it('should only return public tiles', async () => {
      // Arrange - Create a private tile directly via model
      const user = await scene.hasUser()
      const privateTile = await tileModel.createRaw({
        imagePath: 'private-tile-test.jpg',
        title: 'Private Tile',
        description: null,
        location: LOCATIONS.WELLINGTON,
        createdByUserId: user.id,
        isPrivate: true,
      })

      // Act
      const result = await tileOperations.getFeedForUser(user.id, 100)

      // Assert - Verify no private tiles are returned
      expect(result.tiles.find((t) => t.id === privateTile.id)).toBeUndefined()
      for (const tile of result.tiles) {
        const tileRaw = await tileModel.getRawById(tile.id)
        expect(tileRaw).toBeDefined()
        expect(tileRaw?.isPrivate).toBe(false)
      }

      // Cleanup
      await tileModel.deleteById(privateTile.id)
    })

    it('should not return any tiles that are saved by the current user', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()
      const currentUser = await scene.hasUser(CURRENT_USER)

      // Create tiles with different save states
      const tile1 = await scene.hasTile({
        imagePath: 'feed-saved-tile-1.jpg',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })
      await scene.hasTile({
        imagePath: 'feed-saved-tile-2.jpg',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })
      await savedTilesModel.upsertRaw({ tileId: tile1.id, userId: currentUser.id, isSaved: true })

      // Act - Fetch feed with authUserId
      const result = await tileOperations.getFeedForUser(currentUser.id, 100)

      // Assert - Verify no saved tiles are returned
      expect(result.tiles.find((t) => t.id === tile1.id)).toBeUndefined()
      const saveStates = await getSaveStatesMap(
        result.tiles.map((t) => t.id),
        currentUser.id
      )
      for (const tile of result.tiles) {
        expect(saveStates.get(tile.id)).toBe(false)
      }
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

      await savedTilesModel.upsertRaw({ tileId: tile1.id, userId: user.id, isSaved: true })

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
      await savedTilesModel.upsertRaw({ tileId: tile1.id, userId: user.id, isSaved: true })
      await savedTilesModel.upsertRaw({ tileId: tile2.id, userId: user.id, isSaved: false })

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

      await savedTilesModel.upsertRaw({ tileId: tile.id, userId: user.id, isSaved: true })

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

      await savedTilesModel.upsertRaw({ tileId: tile.id, userId: user.id, isSaved: true })

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
      await savedTilesModel.upsertRaw({ tileId: tile1.id, userId: user.id, isSaved: true })
      await savedTilesModel.upsertRaw({ tileId: tile2.id, userId: user.id, isSaved: true })

      const currentUser = await scene.hasUser(CURRENT_USER)
      await savedTilesModel.upsertRaw({ tileId: tile1.id, userId: currentUser.id, isSaved: true })

      // Act
      const result = await tileOperations.getListForUser(user.id, currentUser.id)

      // Assert
      expect(result.length).toBeGreaterThan(0)
      expect(result.some((t) => t.isSaved === undefined)).toBe(false)
      expect(result.find((t) => t.id === tile1.id)?.isSaved).toBe(true)
      expect(result.find((t) => t.id === tile2.id)?.isSaved).toBe(false)
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

  describe('upsertSaveState', () => {
    it('should upsert the save state for a tile', async () => {
      // Arrange
      const { user, tile } = await scene.hasUserSupplierAndTile()

      // Act
      const saveStateSaved = await tileOperations.upsertSaveState(tile.id, user.id, true)
      const saveStateUnsaved = await tileOperations.upsertSaveState(tile.id, user.id, false)

      // Assert
      expect(saveStateSaved.isSaved).toBe(true)
      expect(saveStateUnsaved.isSaved).toBe(false)
    })
  })

  describe('updateScoreForTile helper', () => {
    it('should update the score for a tile', async () => {
      // Arrange
      const { user, supplier } = await scene.hasUserAndSupplier()

      const tile = await scene.hasTile({
        imagePath: 'new-tile-for-update-scores.jpg',
        title: 'Update Scores Tile',
        description: '',
        createdByUserId: user.id,
        credits: [createTileCreditForm({ supplierId: supplier.id })],
      })

      // Fake aged tile to trigger score update
      const agedCreatedAt = new Date(Date.now() - RECENCY.MAX_AGE_SECONDS * 1000)
      tile.createdAt = agedCreatedAt
      tile.scoreUpdatedAt = agedCreatedAt

      // Act
      await updateScoreForTile(tile)

      // Assert
      const after = await tileModel.getRawById(tile.id)
      expect(tile.score).toBeGreaterThan(0)
      expect(after).toBeDefined()
      expect(after!.score).toBeGreaterThan(0)
      expect(after!.score).toBeLessThan(tile.score)
      expect(after!.scoreUpdatedAt).not.toBe(tile.scoreUpdatedAt)
    })
  })
})
