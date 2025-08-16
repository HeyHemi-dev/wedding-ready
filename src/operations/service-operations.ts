import { FindSuppliersResponse } from '@/app/_types/locations'
import { SERVICES } from '@/db/constants'
import { supplierServicesModel } from '@/models/supplier-service'

export const serviceOperations = {
  getAllWithSupplierCount,
}

async function getAllWithSupplierCount(): Promise<FindSuppliersResponse[]> {
  const supplierCounts = await supplierServicesModel.getAllWithSupplierCount()

  // Map for quick lookup
  const countMap = new Map(supplierCounts.map(({ service, supplierCount }) => [service, supplierCount]))

  return Object.entries(SERVICES).map(([key, value]) => ({
    type: 'service',
    key,
    value,
    supplierCount: countMap.get(value) ?? 0,
  }))
}
