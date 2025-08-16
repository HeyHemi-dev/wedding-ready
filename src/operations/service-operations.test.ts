import { describe, it, expect } from 'vitest'

import { SERVICES } from '@/db/constants'

import { serviceOperations } from './service-operations'
import { scene, TEST_SUPPLIER } from '@/testing/scene'

describe('serviceOperations', () => {
  describe('getAllWithSupplierCount', () => {
    it('should return all services with their supplier counts', async () => {
      // Arrange
      const user = await scene.hasUser()
      await scene.hasSupplier({
        createdByUserId: user.id,
      })

      // Act
      const result = await serviceOperations.getAllWithSupplierCount()

      // Assert
      expect(result).toHaveLength(Object.keys(SERVICES).length)
      expect(result.find((item) => item.value === TEST_SUPPLIER.services[0])?.supplierCount).toBeGreaterThan(0)
    })
  })
})
