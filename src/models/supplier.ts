import { and, eq, count, or, ilike } from 'drizzle-orm'

import { db } from '@/db/connection'
import { Service, Location, SupplierRole } from '@/db/constants'
import * as schema from '@/db/schema'
import {
  InsertSupplierRaw,
  InsertSupplierUserRaw,
  SupplierRaw,
  Supplier,
  SupplierWithUsers,
  InsertSupplierServiceRaw,
  InsertSupplierLocationRaw,
  SupplierLocationRaw,
  SupplierServiceRaw,
  SupplierUserRaw,
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

  static async getRawById(id: string): Promise<SupplierRaw | null> {
    const suppliers = await db.select().from(schema.suppliers).where(eq(schema.suppliers.id, id))

    if (suppliers === null || suppliers.length === 0) return null

    return suppliers[0]
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

  static async create(insertSupplierData: InsertSupplierRaw): Promise<SupplierRaw> {
    const suppliers = await db.insert(schema.suppliers).values(insertSupplierData).returning()
    return suppliers[0]
  }

  static async createLocationsForSupplier({ supplierId, locations }: { supplierId: string; locations: Location[] }): Promise<SupplierLocationRaw[]> {
    const insertSupplierLocationData: InsertSupplierLocationRaw[] = locations.map((location) => ({
      supplierId,
      location,
    }))
    return await db.insert(schema.supplierLocations).values(insertSupplierLocationData).returning()
  }

  static async createServicesForSupplier({ supplierId, services }: { supplierId: string; services: Service[] }): Promise<SupplierServiceRaw[]> {
    const insertSupplierServiceData: InsertSupplierServiceRaw[] = services.map((service) => ({
      supplierId,
      service,
    }))
    return await db.insert(schema.supplierServices).values(insertSupplierServiceData).returning()
  }

  static async createUsersForSupplier({ supplierId, users }: { supplierId: string; users: { id: string; role: SupplierRole }[] }): Promise<SupplierUserRaw[]> {
    const insertSupplierUserData: InsertSupplierUserRaw[] = users.map((user) => ({
      supplierId,
      userId: user.id,
      role: user.role,
    }))
    return await db.insert(schema.supplierUsers).values(insertSupplierUserData).returning()
  }

  static async isHandleAvailable({ handle }: { handle: string }): Promise<boolean> {
    const suppliers = await db.select().from(schema.suppliers).where(eq(schema.suppliers.handle, handle))
    return suppliers.length === 0
  }

  static async search(query: string): Promise<SupplierRaw[]> {
    const suppliers = await db
      .select()
      .from(schema.suppliers)
      .where(or(ilike(schema.suppliers.name, `%${query}%`), ilike(schema.suppliers.handle, `%${query}%`)))
      .limit(10)

    return suppliers
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
