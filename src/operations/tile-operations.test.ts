import { afterAll, afterEach, describe, expect, it } from 'vitest'

import { savedTilesModel } from '@/models/saved-tiles'
import { scene, TEST_TILE } from '@/testing/scene'

import { tileOperations } from './tile-operations'

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
    await scene.withoutTilesForSupplier({ supplierHandle: 'testsupplier2' })
    await scene.withoutSupplier({ handle: 'testsupplier2' })
  })

  describe('getById', () => {
    it('should get a tile by id', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })

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
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })

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
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })

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
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })
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
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })

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
      const tile1 = await scene.hasTile({ imagePath: 'image1.jpg', createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })
      await scene.hasTile({ imagePath: 'image2.jpg', createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })

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
      const tile1 = await scene.hasTile({ imagePath: 'image1.jpg', createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })
      const tile2 = await scene.hasTile({ imagePath: 'image2.jpg', createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })
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
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })
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
      await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })

      // Act
      const result = await tileOperations.getListForUser(user.id)

      // Assert
      expect(result.length).toBe(0)
    })

    it('should return isSaved as undefined for all tiles when no authUserId provided', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })
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
      const tile1 = await scene.hasTile({ imagePath: 'image1.jpg', createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })
      const tile2 = await scene.hasTile({ imagePath: 'image2.jpg', createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })
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
  describe('createForSupplier', () => {
    it('should create a tile for a supplier', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })

      // Act
      const result = await tileOperations.createForSupplier({
        imagePath: TEST_TILE.imagePath,
        title: 'Test Title',
        description: 'Test Description',
        location: TEST_TILE.location,
        createdByUserId: user.id,
        credits: [{ supplierId: supplier.id }],
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
          imagePath: TEST_TILE.imagePath,
          title: 'Test Title',
          description: 'Test Description',
          location: TEST_TILE.location,
          createdByUserId: user.id,
          credits: [],
        })
      ).rejects.toThrow()
    })
  })
  describe('getCreditsForTile', () => {
    it('should get the credits for a tile', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })

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
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })

      const supplier2 = await scene.hasSupplier({ handle: 'testsupplier2', createdByUserId: user.id })

      // Act
      const result = await tileOperations.createCreditForTile({ tileId: tile.id, credit: { supplierId: supplier2.id }, authUserId: user.id })

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
        tileOperations.createCreditForTile({ tileId: '00000000-0000-0000-0000-000000000000', credit: { supplierId: supplier.id }, authUserId: user.id })
      ).rejects.toThrow()
    })

    it('should throw an error if the supplier does not exist', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })

      // Act & Assert
      await expect(
        tileOperations.createCreditForTile({ tileId: tile.id, credit: { supplierId: '00000000-0000-0000-0000-000000000000' }, authUserId: user.id })
      ).rejects.toThrow()
    })

    it('should throw an error if the authUserId is not the creator of the tile', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [{ supplierId: supplier.id }] })

      // Act & Assert
      await expect(
        tileOperations.createCreditForTile({ tileId: tile.id, credit: { supplierId: supplier.id }, authUserId: '00000000-0000-0000-0000-000000000000' })
      ).rejects.toThrow()
    })
  })
})
