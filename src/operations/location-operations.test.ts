import { describe, it, expect, vi, beforeEach } from 'vitest'

import { LOCATIONS } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'
import { enumToPretty, keyToEnum } from '@/utils/enum-helpers'

import { locationOperations } from './location-operations'

// Mock the SupplierModel
vi.mock('@/models/supplier', () => ({
  SupplierModel: {
    getCountGroupByLocation: vi.fn(),
  },
}))

describe('locationOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllWithSupplierCount', () => {
    it('should return all locations with their supplier counts', async () => {
      // Mock data
      const mockSupplierCounts = [
        { location: LOCATIONS.AUCKLAND, count: 10 },
        { location: LOCATIONS.WELLINGTON, count: 5 },
      ]

      // Setup mocks
      vi.mocked(SupplierModel.getCountGroupByLocation).mockResolvedValue(mockSupplierCounts)

      // Call the function
      const result = await locationOperations.getAllWithSupplierCount()

      // Verify the result
      const locations = enumToPretty(LOCATIONS)
      expect(result).toHaveLength(locations.length)

      // Check that each location has the correct count
      result.forEach((item) => {
        const location = keyToEnum(LOCATIONS, item.key)
        const expectedCount = mockSupplierCounts.find((sc) => sc.location === location)?.count ?? 0
        expect(item).toEqual({
          type: 'location',
          key: item.key,
          value: item.value,
          supplierCount: expectedCount,
        })
      })

      // Verify the model was called
      expect(SupplierModel.getCountGroupByLocation).toHaveBeenCalledTimes(1)
    })

    it('should handle empty supplier counts', async () => {
      // Mock empty data
      vi.mocked(SupplierModel.getCountGroupByLocation).mockResolvedValue([])

      // Call the function
      const result = await locationOperations.getAllWithSupplierCount()

      // Verify all locations have 0 count
      result.forEach((item) => {
        expect(item.supplierCount).toBe(0)
      })

      // Verify the model was called
      expect(SupplierModel.getCountGroupByLocation).toHaveBeenCalledTimes(1)
    })
  })
})
