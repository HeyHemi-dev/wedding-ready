import { describe, it, expect, beforeEach } from 'vitest'

import { scene, TEST_SUPPLIER } from '@/testing/scene'
import { supplierOperations } from './supplier-operations'

describe('supplierOperations', () => {
  beforeEach(async () => {
    await scene.withoutSupplier({ handle: TEST_SUPPLIER.handle })
  })

  describe('register', () => {
    it('should successfully register a new supplier', async () => {
      // Arrange
      const user = await scene.hasUser()

      // Act
      const result = await supplierOperations.register({
        ...TEST_SUPPLIER,
        createdByUserId: user.id,
      })

      // Assert
      expect(result).toBeDefined()
      expect(result.name).toBe(TEST_SUPPLIER.name)
      expect(result.handle).toBe(TEST_SUPPLIER.handle)
    })
    it('should throw error when handle is already taken', async () => {
      // Arrange
      const user = await scene.hasUser()
      await scene.hasSupplier({ createdByUserId: user.id })

      // Act & Assert
      await expect(
        supplierOperations.register({
          ...TEST_SUPPLIER,
          createdByUserId: user.id,
        })
      ).rejects.toThrow('Handle is already taken')
    })
  })
})
