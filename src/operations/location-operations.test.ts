import { describe, it, expect } from 'vitest'

import { LOCATIONS } from '@/db/constants'

import { locationOperations } from './location-operations'
import { scene, TEST_SUPPLIER } from '@/testing/scene'

describe('locationOperations', () => {
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
