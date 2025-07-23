import { FindSuppliersResponse } from '@/app/_types/locations'
import { LOCATIONS } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'

export const locationOperations = {
  getAllWithSupplierCount,
}

async function getAllWithSupplierCount(): Promise<FindSuppliersResponse[]> {
  const supplierCounts = await SupplierModel.getCountGroupByLocation()

  // Map for quick lookup
  const countMap = new Map(supplierCounts.map(({ location, count }) => [location, count]))

  return Object.entries(LOCATIONS).map(([key, value]) => ({
    type: 'location',
    key,
    value,
    supplierCount: countMap.get(value) ?? 0,
  }))
}
