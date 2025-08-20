import { describe, it, expect, afterAll } from 'vitest'

import { SERVICES } from '@/db/constants'
import { scene, TEST_SUPPLIER } from '@/testing/scene'

import { serviceOperations } from './service-operations'

describe('serviceOperations', () => {
  afterAll(async () => {
    await scene.resetTestData()
  })

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
