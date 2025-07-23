import { FindSuppliersResponse } from '@/app/_types/locations'
import { SERVICES } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'

export const serviceOperations = {
  getAllWithSupplierCount,
}

async function getAllWithSupplierCount(): Promise<FindSuppliersResponse[]> {
  const supplierCounts = await SupplierModel.getCountGroupByService()

  // Map for quick lookup
  const countMap = new Map(supplierCounts.map(({ service, count }) => [service, count]))

  return Object.entries(SERVICES).map(([key, value]) => ({
    type: 'service',
    key,
    value,
    supplierCount: countMap.get(value) ?? 0,
  }))
}
