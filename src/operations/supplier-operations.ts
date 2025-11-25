import { OPERATION_ERROR } from '@/app/_types/errors'
import { Supplier, SupplierList, SupplierSearchResult } from '@/app/_types/suppliers'
import { Handle, SupplierRegistrationForm, SupplierUpdateForm } from '@/app/_types/validation-schema'
import { Location, Service, SUPPLIER_ROLES } from '@/db/constants'
import { supplierModel } from '@/models/supplier'
import { supplierLocationsModel } from '@/models/supplier-location'
import { supplierServicesModel } from '@/models/supplier-service'
import { supplierUsersModel } from '@/models/supplier-user'
import { tileModel } from '@/models/tile'
import * as t from '@/models/types'
import { userProfileModel } from '@/models/user'

export const supplierOperations = {
  getByHandle,
  getListForSupplierGrid,
  register,
  updateProfile,
  search,
}

async function getByHandle(handle: Handle): Promise<Supplier | null> {
  const supplier = await supplierModel.getRawByHandle(handle)
  if (!supplier) return null

  const [supplierUsers, supplierLocations, supplierServices] = await Promise.all([
    supplierUsersModel.getRawForSupplierId(supplier.id),
    supplierLocationsModel.getRawForSupplierId(supplier.id),
    supplierServicesModel.getRawForSupplierId(supplier.id),
  ])

  return {
    id: supplier.id,
    name: supplier.name,
    handle: supplier.handle,
    websiteUrl: supplier.websiteUrl,
    description: supplier.description,
    services: supplierServices.map((s) => s.service!),
    locations: supplierLocations.map((l) => l.location),
    users: supplierUsers.map((u) => ({ id: u.userId, role: u.role })),
  }
}

async function getListForSupplierGrid({ location, service }: { location?: Location; service?: Service }): Promise<SupplierList> {
  if ((!location && !service) || (location && service)) {
    throw OPERATION_ERROR.VALIDATION_ERROR()
  }
  // We can assert that service exists becuase we checked that at least location or service exists, then we check if location doesn't exist. By elimination, service must exist.
  const suppliers = location ? await supplierModel.getAllRawForLocation(location) : await supplierModel.getAllRawForService(service!)

  const supplierIds = suppliers.map((supplier) => supplier.id)

  // Get tiles, locations, and services asyncronously to prevent waterfall
  const [tilesForSuppliers, locationsMap, servicesMap] = await Promise.all([
    Promise.all(
      supplierIds.map(async (supplierId) => {
        const tiles = await tileModel.getManyRawBySupplierId(supplierId, { limit: 3 })
        return { supplierId, tiles }
      })
    ),
    supplierLocationsModel.getMapBySupplierIds(supplierIds),
    supplierServicesModel.getMapBySupplierIds(supplierIds),
  ])

  const tilesMap = new Map(tilesForSuppliers.map((item) => [item.supplierId, item.tiles]))

  return suppliers.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    handle: supplier.handle,
    mainImage: tilesMap.get(supplier.id)?.[0]?.imagePath ?? null,
    thumbnailImages: [tilesMap.get(supplier.id)?.[1]?.imagePath ?? null, tilesMap.get(supplier.id)?.[2]?.imagePath ?? null],
    services: servicesMap.get(supplier.id) ?? [],
    locations: locationsMap.get(supplier.id) ?? [],
    follows: 154, // TODO: get from supplierFollows table
  }))
}

async function register({ name, handle, websiteUrl, description, services, locations }: SupplierRegistrationForm, authUserId: string): Promise<Supplier> {
  const user = await userProfileModel.getRawById(authUserId)
  if (!user) {
    throw OPERATION_ERROR.RESOURCE_NOT_FOUND()
  }

  const isAvailable = await supplierModel.isHandleAvailable(handle)
  if (!isAvailable) {
    throw OPERATION_ERROR.RESOURCE_CONFLICT()
  }

  const insertSupplierData: t.InsertSupplierRaw = {
    name,
    handle,
    createdByUserId: authUserId,
    description,
    websiteUrl,
  }
  const supplier = await supplierModel.createRaw(insertSupplierData)

  const [supplierLocations, supplierServices, supplierUsers] = await Promise.all([
    supplierLocationsModel.createManyRawForSupplierId(supplier.id, locations),
    supplierServicesModel.createManyRawForSupplierId(supplier.id, services),
    // The user who creates the supplier is an admin by default
    supplierUsersModel.createManyRawForSupplierId(supplier.id, [{ id: user.id, role: SUPPLIER_ROLES.ADMIN }]),
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

async function updateProfile(supplierId: string, data: SupplierUpdateForm, authUserId: string): Promise<SupplierUpdateForm> {
  const supplier = await supplierModel.getRawById(supplierId)
  if (!supplier) throw OPERATION_ERROR.RESOURCE_NOT_FOUND()

  const supplierUsers = await supplierUsersModel.getRawForSupplierId(supplierId)
  const authUserRole = supplierUsers.find((su) => su.userId === authUserId)?.role
  if (authUserRole !== SUPPLIER_ROLES.ADMIN && authUserRole !== SUPPLIER_ROLES.STANDARD) throw OPERATION_ERROR.FORBIDDEN()

  const setSupplierData: t.SetSupplierRaw = {
    name: data.name,
    websiteUrl: data.websiteUrl,
    description: data.description,
  }

  const updatedSupplier = await supplierModel.updateRaw(supplierId, setSupplierData)
  return {
    name: updatedSupplier.name,
    websiteUrl: updatedSupplier.websiteUrl ?? undefined,
    description: updatedSupplier.description ?? undefined,
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
