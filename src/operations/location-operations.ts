import { Location } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'
import { enumToPretty, keyToEnum } from '@/utils/enum-helpers'

export const locationOperations = {
  getAllWithSupplierCount,
}

async function getAllWithSupplierCount(): Promise<FindSuppliersItem[]> {
  const locations = enumToPretty(Location)
  return await Promise.all(
    locations.map(async (location) => {
      const suppliers = await SupplierModel.getAllByLocation(keyToEnum(Location, location.key))
      return {
        type: 'location',
        enumKey: location.key,
        enumValue: location.label,
        supplierCount: suppliers.length,
      }
    })
  )
}
