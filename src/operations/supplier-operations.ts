import { OPERATION_ERROR } from '@/app/_types/errors'
import { Supplier, SupplierList, SupplierSearchResult } from '@/app/_types/suppliers'
import { Handle, SupplierRegistrationForm } from '@/app/_types/validation-schema'
import { Location, SUPPLIER_ROLES } from '@/db/constants'
import { supplierModel } from '@/models/supplier'
import { supplierLocationsModel } from '@/models/supplier-location'
import { supplierServicesModel } from '@/models/supplier-service'
import { supplierUsersModel } from '@/models/supplier-user'
import { tileModel } from '@/models/tile'
import { InsertSupplierRaw, Tile } from '@/models/types'
import { UserDetailModel } from '@/models/user'

export const supplierOperations = {
  getByHandle,
  getListForLocation,
  register,
  search,
}

async function getByHandle(handle: Handle): Promise<Supplier | null> {
  const supplier = await supplierModel.getByHandle(handle)
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

async function getListForLocation(location: Location): Promise<SupplierList> {
  const suppliers = await supplierModel.getAllForLocation(location)
  const supplierIds = suppliers.map((supplier) => supplier.id)
  const [locationsForSuppliers, servicesForSuppliers] = await Promise.all([
    supplierLocationsModel.getForSupplierIds(supplierIds),
    supplierServicesModel.getForSupplierIds(supplierIds),
  ])

  const tilePromises = supplierIds.map(async (supplierId) => {
    const tiles = await tileModel.getBySupplierId(supplierId)
    return { supplierId, tiles }
  })

  const tilesForSuppliers = await Promise.all(tilePromises)

  const locationsMap = new Map(locationsForSuppliers.map((item) => [item.supplierId, item.locations]))
  const servicesMap = new Map(servicesForSuppliers.map((item) => [item.supplierId, item.services]))
  const tilesMap = new Map(tilesForSuppliers.map((item) => [item.supplierId, item.tiles]))

  return suppliers.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    handle: supplier.handle,
    mainImage: tilesMap.get(supplier.id)?.[0]?.imagePath ?? '',
    thumbnailImages: [tilesMap.get(supplier.id)?.[0]?.imagePath ?? '', tilesMap.get(supplier.id)?.[1]?.imagePath ?? ''],
    services: servicesMap.get(supplier.id) ?? [],
    locations: locationsMap.get(supplier.id) ?? [],
    follows: 154, // TODO: get from supplierFollows table
  }))
}

async function register({ name, handle, websiteUrl, description, services, locations, createdByUserId }: SupplierRegistrationForm): Promise<Supplier> {
  const user = await UserDetailModel.getById(createdByUserId)
  if (!user) {
    throw OPERATION_ERROR.FORBIDDEN
  }

  const isAvailable = await supplierModel.isHandleAvailable({ handle })
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

  const supplier = await supplierModel.create(insertSupplierData)

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
    locations: supplierLocations.map((location) => location.location),
    users: supplierUsers.map((user) => ({ id: user.userId, role: user.role })),
  }
}

async function search(query: string): Promise<SupplierSearchResult[]> {
  const suppliers = await supplierModel.search(query)
  return suppliers.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    handle: supplier.handle,
  }))
}
