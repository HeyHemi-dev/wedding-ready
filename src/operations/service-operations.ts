import { FindSuppliersResponse } from '@/app/_types/locations'
import { Service } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'
import { enumToPretty, keyToEnum } from '@/utils/enum-helpers'

export const serviceOperations = {
  getAllWithSupplierCount,
}

async function getAllWithSupplierCount(): Promise<FindSuppliersResponse[]> {
  const services = enumToPretty(Service)
  const supplierCounts = await SupplierModel.getCountGroupByService()

  // Map for quick lookup
  const countMap = new Map(supplierCounts.map(({ service, count }) => [service, count]))

  return services.map((service) => ({
    type: 'service',
    key: service.key,
    value: service.label,
    supplierCount: countMap.get(keyToEnum(Service, service.key)) ?? 0,
  }))
}
