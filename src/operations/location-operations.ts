import { FindSuppliersResponse } from '@/app/_types/locations'
import { LOCATIONS } from '@/db/constants'
import { supplierLocationsModel } from '@/models/supplier-location'

export const locationOperations = {
  getAllWithSupplierCount,
}

async function getAllWithSupplierCount(): Promise<FindSuppliersResponse[]> {
  const supplierCounts = await supplierLocationsModel.getAllWithSupplierCount()

  // Map for quick lookup
  const countMap = new Map(supplierCounts.map(({ location, supplierCount }) => [location, supplierCount]))

  return Object.entries(LOCATIONS).map(([key, value]) => ({
    type: 'location',
    key,
    value,
    supplierCount: countMap.get(value) ?? 0,
  }))
}
