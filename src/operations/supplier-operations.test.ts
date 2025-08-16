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

    it('should throw error when user is not found', async () => {
      // Arrange, Act & Assert
      await expect(
        supplierOperations.register({
          ...TEST_SUPPLIER,
          createdByUserId: '00000000-0000-0000-0000-000000000000',
        })
      ).rejects.toThrow('User not found')
    })
  })

  describe('search', () => {
    it('should return suppliers with the given query', async () => {
      // Arrange
      const user = await scene.hasUser()
      await scene.hasSupplier({ createdByUserId: user.id })
      const query = TEST_SUPPLIER.handle.slice(0, 3)

      // Act
      const result = await supplierOperations.search(query)

      // Assert
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      expect(result.find((r) => r.handle === TEST_SUPPLIER.handle)).toBeDefined()
    })

    it('should handle case insensitivity', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const query = supplier.handle.toUpperCase()

      // Act
      const result = await supplierOperations.search(query)

      // Assert
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      expect(result.find((r) => r.handle === supplier.handle)).toBeDefined()
    })

    it('should handle partial matches', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const query = supplier.handle.slice(3, 6)

      // Act
      const result = await supplierOperations.search(query)

      // Assert
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      expect(result.find((r) => r.handle === supplier.handle)).toBeDefined()
    })

    it('should return empty array when no suppliers are found', async () => {
      // Arrange
      const user = await scene.hasUser()
      await scene.hasSupplier({ createdByUserId: user.id })
      const query = 'nonexistent'

      // Act
      const result = await supplierOperations.search(query)

      // Assert
      expect(result).toBeDefined()
      expect(result.length).toBe(0)
    })
  })
})
