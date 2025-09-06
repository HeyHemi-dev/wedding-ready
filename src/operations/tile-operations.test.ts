import { afterAll, describe, expect, it } from 'vitest'

import { SERVICES } from '@/db/constants'
import { scene } from '@/testing/scene'

import { tileOperations } from './tile-operations'
import { savedTilesModel } from '@/models/savedTiles'

describe('tileOperations', () => {
  afterAll(async () => {
    await scene.resetTestData()
  })

  describe('getById', () => {
    it('should get a tile by id', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id, service: SERVICES.PHOTOGRAPHER }] })

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
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id, service: SERVICES.PHOTOGRAPHER }] })
      savedTilesModel.upsertSavedTileRaw({ tileId: tile.id, userId: user.id, isSaved: true })

      // Act
      const result = await tileOperations.getById(tile.id)

      // Assert
      expect(result.isSaved).toBeUndefined()
    })

    it('Should return isSaved as true when authUserId provided', async () => {})

    it('Should return isSaved as false when authUserId provided but tile is not saved', async () => {})
  })
  describe('getListForSupplier', () => {
    it('should get a list of tiles for a supplier', async () => {})

    it('should return empty array when supplier has no tiles', async () => {})

    it('should return all tiles for a supplier', async () => {})

    it('should return isSaved as undefined for all tiles when no authUserId provided', async () => {})

    it('should return correct isSaved status for each tile when authUserId provided', async () => {})
  })
  describe('getListForUser', () => {
    it('should get a list of tiles saved by a user', async () => {})

    it('should return empty array when user has no saved tiles', async () => {})

    it('should return all tiles for a user', async () => {})

    it('should return isSaved as undefined for all tiles when no authUserId provided', async () => {})

    it('should return correct isSaved status for each tile when authUserId provided', async () => {})
  })
  describe('createForSupplier', () => {
    it('should create a tile for a supplier', async () => {})

    it('should throw an error if no credits are provided', async () => {})

    it('should throw an error if the supplier does not exist', async () => {})
  })
  describe('getCreditsForTile', () => {
    it('should get the credits for a tile', async () => {})

    it('should return empty array if the tile does not exist', async () => {})
  })
  describe('createCreditForTile', () => {
    it('should create a credit for a tile', async () => {})

    it('should throw an error if the tile does not exist', async () => {})

    it('should throw an error if the supplier does not exist', async () => {})

    it('should throw an error if the authUserId is not the creator of the tile', async () => {})
  })
})
