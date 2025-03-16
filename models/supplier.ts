import { db } from '@/db/db'
import {
  suppliers as suppliersTable,
  supplierColumns,
  supplierUsers as supplierUsersTable,
  supplierLocations as supplierLocationsTable,
  supplierServices as supplierServicesTable,
} from '@/db/schema'
import {
  InsertSupplier,
  InsertSupplierUser,
  Supplier,
  SupplierWithDetail,
  SupplierWithUsers,
  User,
  UserWithDetail,
  InsertSupplierService,
  InsertSupplierLocation,
} from '@/models/types'
import { Service, SupplierRole, Location } from '@/models/constants'
import { and, eq } from 'drizzle-orm'

const supplierBaseQuery = db
  .select({
    ...supplierColumns,
    service: supplierServicesTable.service,
    location: supplierLocationsTable.location,
  })
  .from(suppliersTable)
  .leftJoin(supplierServicesTable, eq(suppliersTable.id, supplierServicesTable.supplierId))
  .leftJoin(supplierLocationsTable, eq(suppliersTable.id, supplierLocationsTable.supplierId))

interface SupplierBaseQueryResult extends Supplier {
  service: Service | null
  location: Location | null
}

export class SupplierModel {
  private supplier: Supplier

  constructor(supplier: Supplier) {
    this.supplier = supplier
  }

  static async getAll(service?: Service, location?: Location): Promise<SupplierWithDetail[]> {
    const conditions = []

    if (service) conditions.push(eq(supplierServicesTable.service, service))

    if (location) conditions.push(eq(supplierLocationsTable.location, location))

    const result = await supplierBaseQuery.where(conditions.length > 0 ? and(...conditions) : undefined)
    return aggregateSupplierQueryResults(result)
  }

  static async getByHandle(handle: string): Promise<SupplierWithUsers | null> {
    const result = await supplierBaseQuery.where(eq(suppliersTable.handle, handle))

    if (result.length === 0) {
      return null
    }

    const suppliers = aggregateSupplierQueryResults(result)

    // There should only be one supplier with this handle because of db constraints.
    const supplier = suppliers[0]
    const supplierUsers = await db.select().from(supplierUsersTable).where(eq(supplierUsersTable.supplierId, supplier.id))

    return {
      ...supplier,
      users: supplierUsers,
    }
  }

  static async create(user: User | UserWithDetail, insertSupplierData: InsertSupplier, services: Service[], locations: Location[]): Promise<SupplierWithUsers> {
    const suppliers = await db.insert(suppliersTable).values(insertSupplierData).returning()
    const supplier = suppliers[0]

    // The user who creates the supplier is automatically an admin
    const insertSupplierUserData: InsertSupplierUser = {
      supplierId: supplier.id,
      userId: user.id,
      role: SupplierRole.ADMIN,
    }
    const supplierUsers = await db.insert(supplierUsersTable).values(insertSupplierUserData).returning()

    const insertSupplierServiceData: InsertSupplierService[] = services.map((service) => ({
      supplierId: supplier.id,
      service,
    }))
    const supplierServices = await db.insert(supplierServicesTable).values(insertSupplierServiceData).returning()

    const insertSupplierLocationData: InsertSupplierLocation[] = locations.map((location) => ({
      supplierId: supplier.id,
      location,
    }))
    const supplierLocations = await db.insert(supplierLocationsTable).values(insertSupplierLocationData).returning()

    // We can assert that the services and locations exist because we just inserted them.
    // TODO: remove this assert when services and locations are non-nullable in the db schema.
    return {
      ...supplier,
      users: supplierUsers,
      services: supplierServices.map((service) => service.service!),
      locations: supplierLocations.map((location) => location.location!),
    }
  }
}

function aggregateSupplierQueryResults(result: SupplierBaseQueryResult[]): SupplierWithDetail[] {
  // Create a map that we can iterate through, constructing a  SupplierWithDetail for each supplier
  const supplierMap = new Map<string, SupplierWithDetail>()

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
