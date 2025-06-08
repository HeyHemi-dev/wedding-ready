import { Location } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'
import { enumToPretty, keyToEnum } from '@/utils/enum-helpers'

export const locationOperations = {
  getAllWithSupplierCount,
}

async function getAllWithSupplierCount(): Promise<FindSuppliersResponse[]> {
  const locations = enumToPretty(Location)
  const supplierCounts = await SupplierModel.getCountGroupByLocation()

  // Map for quick lookup
  const countMap = new Map(supplierCounts.map(({ location, count }) => [location, count]))

  return locations.map((location) => ({
    type: 'location',
    key: location.key,
    value: location.label,
    supplierCount: countMap.get(keyToEnum(Location, location.key)) ?? 0,
  }))
}
