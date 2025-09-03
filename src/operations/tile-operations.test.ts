import { afterAll, describe, expect, it } from 'vitest'

import { scene } from '@/testing/scene'

import { tileOperations } from './tile-operations'
import { SERVICES } from '@/db/constants'

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
  })
})
