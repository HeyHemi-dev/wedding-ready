import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Service } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'
import { serviceOperations } from './service-operations'
import { enumToPretty, keyToEnum } from '@/utils/enum-helpers'

// Mock the SupplierModel
vi.mock('@/models/supplier', () => ({
  SupplierModel: {
    getCountGroupByService: vi.fn(),
  },
}))

describe('serviceOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllWithSupplierCount', () => {
    it('should return all services with their supplier counts', async () => {
      // Mock data
      const mockSupplierCounts = [
        { service: Service.PHOTOGRAPHER, count: 5 },
        { service: Service.VIDEOGRAPHER, count: 3 },
      ]

      // Setup mocks
      vi.mocked(SupplierModel.getCountGroupByService).mockResolvedValue(mockSupplierCounts)

      // Call the function
      const result = await serviceOperations.getAllWithSupplierCount()

      // Verify the result
      const services = enumToPretty(Service)
      expect(result).toHaveLength(services.length)

      // Check that each service has the correct count
      result.forEach((item) => {
        const service = keyToEnum(Service, item.key)
        const expectedCount = mockSupplierCounts.find((sc) => sc.service === service)?.count ?? 0
        expect(item).toEqual({
          type: 'service',
          key: item.key,
          value: item.value,
          supplierCount: expectedCount,
        })
      })

      // Verify the model was called
      expect(SupplierModel.getCountGroupByService).toHaveBeenCalledTimes(1)
    })

    it('should handle empty supplier counts', async () => {
      // Mock empty data
      vi.mocked(SupplierModel.getCountGroupByService).mockResolvedValue([])

      // Call the function
      const result = await serviceOperations.getAllWithSupplierCount()

      // Verify all services have 0 count
      result.forEach((item) => {
        expect(item.supplierCount).toBe(0)
      })

      // Verify the model was called
      expect(SupplierModel.getCountGroupByService).toHaveBeenCalledTimes(1)
    })
  })
})
