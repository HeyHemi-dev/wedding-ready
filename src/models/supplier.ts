import { and, eq, or, ilike, inArray, isNotNull } from 'drizzle-orm'

import { db } from '@/db/connection'
import { Service, Location } from '@/db/constants'
import * as schema from '@/db/schema'
import { InsertSupplierRaw, SupplierRaw, Supplier, SupplierWithUsers, SupplierWithThumbnails } from '@/models/types'

export const supplierModel = {
  getRawById,
  getAll,
  getAllForLocation,
  getAllForService,
  getByHandle,
  create,
  isHandleAvailable,
  search,
}

async function getRawById(id: string): Promise<SupplierRaw | null> {
  const suppliers = await db.select().from(schema.suppliers).where(eq(schema.suppliers.id, id))

  if (suppliers === null || suppliers.length === 0) return null

  return suppliers[0]
}

async function getAll({ service, location }: { service?: Service; location?: Location } = {}): Promise<Supplier[]> {
  const conditions = []

  if (service) conditions.push(eq(schema.supplierServices.service, service))

  if (location) conditions.push(eq(schema.supplierLocations.location, location))

  const result = await supplierBaseQuery.where(conditions.length > 0 ? and(...conditions) : undefined)
  return aggregateSupplierQueryResults(result)
}

async function getAllForLocation(location: Location): Promise<SupplierRaw[]> {
  return await db
    .select({
      ...schema.supplierColumns,
    })
    .from(schema.suppliers)
    .innerJoin(schema.supplierLocations, eq(schema.suppliers.id, schema.supplierLocations.supplierId))
    .where(eq(schema.supplierLocations.location, location))
}

async function getAllForService(service: Service): Promise<SupplierRaw[]> {
  return await db
    .select({
      ...schema.supplierColumns,
    })
    .from(schema.suppliers)
    .innerJoin(schema.supplierServices, eq(schema.suppliers.id, schema.supplierServices.supplierId))
    .where(eq(schema.supplierServices.service, service))
}

async function getByHandle(handle: string): Promise<SupplierWithUsers | null> {
  const result = await supplierBaseQuery.where(eq(schema.suppliers.handle, handle))

  if (result.length === 0) {
    return null
  }

  const suppliers = aggregateSupplierQueryResults(result)

  // There should only be one supplier with this handle because of db constraints.
  const supplier = suppliers[0]
  const supplierUsers = await db.select().from(schema.supplierUsers).where(eq(schema.supplierUsers.supplierId, supplier.id))

  return {
    ...supplier,
    users: supplierUsers,
  }
}

async function create(insertSupplierData: InsertSupplierRaw): Promise<SupplierRaw> {
  const suppliers = await db.insert(schema.suppliers).values(insertSupplierData).returning()
  return suppliers[0]
}

async function isHandleAvailable({ handle }: { handle: string }): Promise<boolean> {
  const suppliers = await db.select().from(schema.suppliers).where(eq(schema.suppliers.handle, handle))
  return suppliers.length === 0
}

async function search(query: string): Promise<SupplierRaw[]> {
  const suppliers = await db
    .select()
    .from(schema.suppliers)
    .where(or(ilike(schema.suppliers.name, `%${query}%`), ilike(schema.suppliers.handle, `%${query}%`)))
    .limit(10)

  return suppliers
}

const supplierBaseQuery = db
  .select({
    ...schema.supplierColumns,
    service: schema.supplierServices.service,
    location: schema.supplierLocations.location,
  })
  .from(schema.suppliers)
  .leftJoin(schema.supplierServices, eq(schema.suppliers.id, schema.supplierServices.supplierId))
  .leftJoin(schema.supplierLocations, eq(schema.suppliers.id, schema.supplierLocations.supplierId))

interface SupplierBaseQueryResult extends SupplierRaw {
  service: Service | null
  location: Location | null
}

function aggregateSupplierQueryResults(result: SupplierBaseQueryResult[]): Supplier[] {
  // Create a map that we can iterate through, constructing a  Supplier for each supplier
  const supplierMap = new Map<string, Supplier>()

  for (const row of result) {
    const supplierId = row.id
    if (!supplierMap.has(supplierId)) {
      supplierMap.set(supplierId, {
        ...row,
        services: [],
        locations: [],
      })
    }

    // We can assert the supplierId is in the map, because we just created it if it didn't already exist
    const supplierWithDetail = supplierMap.get(supplierId)!

    if (row.service && !supplierWithDetail.services.includes(row.service)) {
      supplierWithDetail.services.push(row.service)
    }
    if (row.location && !supplierWithDetail.locations.includes(row.location)) {
      supplierWithDetail.locations.push(row.location)
    }
  }

  return Array.from(supplierMap.values())
}
