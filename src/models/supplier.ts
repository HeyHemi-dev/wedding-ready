import { and, eq, count } from 'drizzle-orm'

import { db } from '@/db/connection'
import { Service, SupplierRoleEnum, Location } from '@/db/constants'
import * as schema from '@/db/schema'
import {
  InsertSupplierRaw,
  InsertSupplierUserRaw,
  SupplierRaw,
  Supplier,
  SupplierWithUsers,
  AuthUser,
  User,
  InsertSupplierServiceRaw,
  InsertSupplierLocationRaw,
} from '@/models/types'

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

export class SupplierModel {
  private supplier: Supplier

  constructor(supplierRaw: SupplierRaw, services: Service[], locations: Location[]) {
    this.supplier = {
      ...supplierRaw,
      services,
      locations,
    }
  }

  static async getAll({ service, location }: { service?: Service; location?: Location } = {}): Promise<Supplier[]> {
    const conditions = []

    if (service) conditions.push(eq(schema.supplierServices.service, service))

    if (location) conditions.push(eq(schema.supplierLocations.location, location))

    const result = await supplierBaseQuery.where(conditions.length > 0 ? and(...conditions) : undefined)
    return aggregateSupplierQueryResults(result)
  }

  static async getAllByTileId(tileId: string): Promise<SupplierRaw[]> {
    const suppliers = await db
      .select({ ...schema.supplierColumns })
      .from(schema.suppliers)
      .innerJoin(schema.tileSuppliers, eq(schema.suppliers.id, schema.tileSuppliers.supplierId))
      .where(eq(schema.tileSuppliers.tileId, tileId))

    return suppliers
  }

  static async getByHandle(handle: string): Promise<SupplierWithUsers | null> {
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

  static async create(user: AuthUser | User, insertSupplierData: InsertSupplierRaw, services: Service[], locations: Location[]): Promise<SupplierWithUsers> {
    const suppliers = await db.insert(schema.suppliers).values(insertSupplierData).returning()
    const supplier = suppliers[0]

    // The user who creates the supplier is automatically an admin
    const insertSupplierUserData: InsertSupplierUserRaw = {
      supplierId: supplier.id,
      userId: user.id,
      role: SupplierRoleEnum.ADMIN,
    }
    const supplierUsers = await db.insert(schema.supplierUsers).values(insertSupplierUserData).returning()

    const insertSupplierServiceData: InsertSupplierServiceRaw[] = services.map((service) => ({
      supplierId: supplier.id,
      service,
    }))
    const supplierServices = await db.insert(schema.supplierServices).values(insertSupplierServiceData).returning()

    const insertSupplierLocationData: InsertSupplierLocationRaw[] = locations.map((location) => ({
      supplierId: supplier.id,
      location,
    }))
    const supplierLocations = await db.insert(schema.supplierLocations).values(insertSupplierLocationData).returning()

    // We can assert that the services and locations exist because we just inserted them.
    // TODO: remove this assert when services and locations are non-nullable in the db schema.
    return {
      ...supplier,
      users: supplierUsers,
      services: supplierServices.map((service) => service.service!),
      locations: supplierLocations.map((location) => location.location!),
    }
  }

  static async isHandleAvailable({ handle }: { handle: string }): Promise<boolean> {
    const suppliers = await db.select().from(schema.suppliers).where(eq(schema.suppliers.handle, handle))
    return suppliers.length === 0
  }

  static async getCountGroupByLocation(): Promise<{ location: Location; count: number }[]> {
    const result = await db
      .select({
        location: schema.supplierLocations.location,
        count: count(schema.suppliers.id),
      })
      .from(schema.suppliers)
      .innerJoin(schema.supplierLocations, eq(schema.suppliers.id, schema.supplierLocations.supplierId))
      .groupBy(schema.supplierLocations.location)

    return result
  }

  static async getCountGroupByService(): Promise<{ service: Service; count: number }[]> {
    const result = await db
      .select({
        service: schema.supplierServices.service,
        count: count(schema.suppliers.id),
      })
      .from(schema.suppliers)
      .innerJoin(schema.supplierServices, eq(schema.suppliers.id, schema.supplierServices.supplierId))
      .groupBy(schema.supplierServices.service)

    return result
  }
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
