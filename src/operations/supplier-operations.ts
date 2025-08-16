import { OPERATION_ERROR } from '@/app/_types/errors'
import { Supplier, SupplierSearchResult } from '@/app/_types/suppliers'
import { Handle, SupplierRegistrationForm } from '@/app/_types/validation-schema'
import { SUPPLIER_ROLES } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'
import { supplierLocationsModel } from '@/models/supplier-location'
import { supplierServicesModel } from '@/models/supplier-service'
import { supplierUsersModel } from '@/models/supplier-user'
import { InsertSupplierRaw } from '@/models/types'
import { UserDetailModel } from '@/models/user'

export const supplierOperations = {
  getByHandle,
  register,
  search,
}

async function getByHandle(handle: Handle): Promise<Supplier | null> {
  const supplier = await SupplierModel.getByHandle(handle)
  if (!supplier) return null

  return {
    id: supplier.id,
    name: supplier.name,
    handle: supplier.handle,
    websiteUrl: supplier.websiteUrl,
    description: supplier.description,
    services: supplier.services,
    locations: supplier.locations,
    users: supplier.users.map((user) => ({ id: user.userId, role: user.role })),
  }
}

async function register({ name, handle, websiteUrl, description, services, locations, createdByUserId }: SupplierRegistrationForm): Promise<Supplier> {
  const user = await UserDetailModel.getById(createdByUserId)
  if (!user) {
    throw OPERATION_ERROR.FORBIDDEN
  }

  const isAvailable = await SupplierModel.isHandleAvailable({ handle })
  if (!isAvailable) {
    throw OPERATION_ERROR.HANDLE_TAKEN
  }

  const insertSupplierData: InsertSupplierRaw = {
    name,
    handle,
    createdByUserId,
    description,
    websiteUrl,
  }

  const supplier = await SupplierModel.create(insertSupplierData)

  const [supplierLocations, supplierServices, supplierUsers] = await Promise.all([
    supplierLocationsModel.createForSupplierId({ supplierId: supplier.id, locations }),
    supplierServicesModel.createForSupplierId({ supplierId: supplier.id, services }),
    // The user who creates the supplier is an admin by default
    supplierUsersModel.createForSupplierId({ supplierId: supplier.id, users: [{ id: user.id, role: SUPPLIER_ROLES.ADMIN }] }),
  ])

  return {
    id: supplier.id,
    name: supplier.name,
    handle: supplier.handle,
    websiteUrl: supplier.websiteUrl,
    description: supplier.description,
    services: supplierServices.map((service) => service.service!),
    locations: supplierLocations.map((location) => location.location!),
    users: supplierUsers.map((user) => ({ id: user.userId, role: user.role })),
  }
}

async function search(query: string): Promise<SupplierSearchResult[]> {
  const suppliers = await SupplierModel.search(query)
  return suppliers.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    handle: supplier.handle,
  }))
}
