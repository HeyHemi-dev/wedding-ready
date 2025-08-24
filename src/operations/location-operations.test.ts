import { describe, it, expect, afterAll } from 'vitest'

import { LOCATIONS } from '@/db/constants'
import { scene, TEST_SUPPLIER } from '@/testing/scene'

import { locationOperations } from './location-operations'

describe('locationOperations', () => {
  afterAll(async () => {
    await scene.resetTestData()
  })

  describe('getAllWithSupplierCount', () => {
    it('should return all locations with their supplier counts', async () => {
      // Arrange
      const user = await scene.hasUser()
      await scene.hasSupplier({
        createdByUserId: user.id,
      })

      // Act
      const result = await locationOperations.getAllWithSupplierCount()

      // Assert
      expect(result).toHaveLength(Object.keys(LOCATIONS).length)
      expect(result.find((item) => item.value === TEST_SUPPLIER.locations[0])?.supplierCount).toBeGreaterThan(0)
    })
  })
})
