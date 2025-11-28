import { describe, it, expect, afterEach, afterAll } from 'vitest'

import { LOCATIONS } from '@/db/constants'
import { supplierModel } from '@/models/supplier'
import { createTileCreditForm, createSupplierUpdateForm, scene, TEST_SUPPLIER } from '@/testing/scene'

import { supplierOperations } from './supplier-operations'

describe('supplierOperations', () => {
  afterEach(async () => {
    await scene.resetTestData()
  })

  afterAll(async () => {
    await scene.resetTestData()
  })

  describe('getByHandle', () => {
    it('should return a supplier by handle', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })

      // Act
      const result = await supplierOperations.getByHandle(supplier.handle)

      // Assert
      expect(result).toBeDefined()
      expect(result?.handle).toBe(supplier.handle)
    })

    it('should return null if the supplier does not exist', async () => {
      // Arrange
      await scene.hasUser()
      await scene.withoutSupplier({ handle: 'nonexistent' })

      // Act
      const result = await supplierOperations.getByHandle('nonexistent')

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('getListForSupplierGrid', () => {
    it('should return a list of suppliers with their locations, services, and tiles', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id, locations: [LOCATIONS.OTAGO] })
      const tile = await scene.hasTile({ createdByUserId: user.id, credits: [createTileCreditForm({ supplierId: supplier.id })] })

      // Act
      const result = await supplierOperations.getListForSupplierGrid({ location: LOCATIONS.OTAGO })

      // Assert
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      expect(result.find((item) => item.handle === supplier.handle)).toBeDefined()
      expect(result.find((item) => item.handle === supplier.handle)?.mainImage).toBe(tile.imagePath)
      expect(result.find((item) => item.handle === supplier.handle)?.locations).toBeDefined()
      expect(result.find((item) => item.handle === supplier.handle)?.services).toBeDefined()
    })
  })

  describe('register', () => {
    it('should successfully register a new supplier', async () => {
      // Arrange
      const user = await scene.hasUser()

      // Act
      const result = await supplierOperations.register(TEST_SUPPLIER, user.id)

      // Assert
      expect(result).toBeDefined()
      expect(result.handle).toBe(TEST_SUPPLIER.handle)
    })

    it('should throw error when handle is already taken', async () => {
      // Arrange
      const user = await scene.hasUser()
      await scene.hasSupplier({ createdByUserId: user.id })

      // Act & Assert
      await expect(supplierOperations.register(TEST_SUPPLIER, user.id)).rejects.toThrow()
    })

    it('should throw error when user is not found', async () => {
      // Arrange, Act & Assert
      await expect(supplierOperations.register(TEST_SUPPLIER, '00000000-0000-0000-0000-000000000000')).rejects.toThrow()
    })

    it('should convert empty strings to null for optional fields (websiteUrl, description)', async () => {
      // Arrange
      const user = await scene.hasUser()

      // Act
      const result = await supplierOperations.register(
        {
          ...TEST_SUPPLIER,
          websiteUrl: '',
          description: '',
        },
        user.id
      )

      // Assert - Check that empty strings were converted to null in the DB
      const supplier = await supplierModel.getRawById(result.id)
      expect(supplier).toBeDefined()
      expect(supplier?.websiteUrl).toBeNull()
      expect(supplier?.description).toBeNull()
    })

    it('should handle mixed empty and non-empty optional fields', async () => {
      // Arrange
      const user = await scene.hasUser()

      // Act
      const result = await supplierOperations.register(
        {
          ...TEST_SUPPLIER,
          websiteUrl: 'https://example.com',
          description: '',
        },
        user.id
      )

      // Assert
      const supplier = await supplierModel.getRawById(result.id)
      expect(supplier).toBeDefined()
      expect(supplier?.websiteUrl).toBe('https://example.com')
      expect(supplier?.description).toBeNull()
    })
  })

  describe('updateProfile', () => {
    it('should successfully update a supplier profile', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id, name: 'Test Supplier' })

      const updatedSupplier = await supplierOperations.updateProfile(supplier.id, createSupplierUpdateForm({ name: 'Updated Supplier' }), user.id)

      // Assert
      expect(updatedSupplier).toBeDefined()
      expect(updatedSupplier.name).toBe('Updated Supplier')
      expect(updatedSupplier.name).not.toBe(supplier.name)
    })

    it('should throw error when supplier is not found', async () => {
      // Arrange,
      const user = await scene.hasUser()

      // Act & Assert
      await expect(
        supplierOperations.updateProfile('00000000-0000-0000-0000-000000000000', createSupplierUpdateForm({ name: 'Updated Supplier' }), user.id)
      ).rejects.toThrow()
    })

    it('should throw error when user does not have the correct role', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })

      await expect(
        supplierOperations.updateProfile(supplier.id, createSupplierUpdateForm({ name: 'Updated Supplier' }), '00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow()
    })

    it('should convert empty strings to null for optional fields (websiteUrl, description)', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })

      // Act
      await supplierOperations.updateProfile(supplier.id, createSupplierUpdateForm({ name: 'Updated Supplier', websiteUrl: '', description: '' }), user.id)

      // Assert
      const updatedSupplier = await supplierModel.getRawById(supplier.id)
      expect(updatedSupplier?.name).toBe('Updated Supplier')
      expect(updatedSupplier?.websiteUrl).toBeNull()
      expect(updatedSupplier?.description).toBeNull()
    })

    it('should handle mixed empty and non-empty optional fields', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })

      // Act
      await supplierOperations.updateProfile(
        supplier.id,
        createSupplierUpdateForm({ name: 'Updated Supplier', websiteUrl: 'https://example.com', description: '' }),
        user.id
      )

      // Assert
      const updatedSupplier = await supplierModel.getRawById(supplier.id)
      expect(updatedSupplier?.name).toBe('Updated Supplier')
      expect(updatedSupplier?.websiteUrl).toBe('https://example.com')
      expect(updatedSupplier?.description).toBeNull()
    })

    it('should preserve non-empty optional fields', async () => {
      // Arrange
      const user = await scene.hasUser()
      const supplier = await scene.hasSupplier({ createdByUserId: user.id })
      const websiteUrl = 'https://new-example.com'
      const description = 'New description'

      // Act
      await supplierOperations.updateProfile(supplier.id, createSupplierUpdateForm({ name: 'Updated Supplier', websiteUrl, description }), user.id)

      // Assert
      const updatedSupplier = await supplierModel.getRawById(supplier.id)
      expect(updatedSupplier?.name).toBe('Updated Supplier')
      expect(updatedSupplier?.websiteUrl).toBe(websiteUrl)
      expect(updatedSupplier?.description).toBe(description)
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
