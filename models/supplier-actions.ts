import { db } from '@/db/db'
import {
  suppliers as suppliersTable,
  supplierUsers as supplierUsersTable,
  supplierLocations as supplierLocationsTable,
  locations as locationsTable,
  supplierServices as supplierServicesTable,
} from '@/db/schema'
import { InsertSupplier, InsertSupplierUser, Supplier, SupplierWithDetail, SupplierWithUsers, supplierColumns } from '@/models/suppliers'
import { Service, SupplierRole } from '@/models/constants'
import { Location } from '@/models/locations'
import { User, UserWithDetail } from '@/models/users'
import { and, eq } from 'drizzle-orm'

const supplierBaseQuery = db
  .select({
    ...supplierColumns,
    service: supplierServicesTable.service,
    location: locationsTable,
  })
  .from(suppliersTable)
  .leftJoin(supplierServicesTable, eq(suppliersTable.id, supplierServicesTable.supplierId))
  .leftJoin(supplierLocationsTable, eq(suppliersTable.id, supplierLocationsTable.supplierId))
  .leftJoin(locationsTable, eq(supplierLocationsTable.locationId, locationsTable.id))

interface SupplierBaseQueryResult extends Supplier {
  service: Service | null
  location: Location | null
}

function aggregateSupplierQueryResults(result: SupplierBaseQueryResult[]): SupplierWithDetail[] {
  // Group results by supplier
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

    const supplierWithDetail = supplierMap.get(supplierId)!

    // Add service if it exists and isn't already in the array
    if (row.service && !supplierWithDetail.services.includes(row.service)) {
      supplierWithDetail.services.push(row.service)
    }

    // Add location if it exists and isn't already in the array
    if (row.location && !supplierWithDetail.locations.includes(row.location)) {
      supplierWithDetail.locations.push(row.location)
    }
  }

  return Array.from(supplierMap.values())
}

class SupplierActions {
  private supplier: Supplier

  constructor(supplier: Supplier) {
    this.supplier = supplier
  }

  static async getAll(service?: Service, location?: Location): Promise<SupplierWithDetail[]> {
    const conditions = []

    if (service) conditions.push(eq(supplierServicesTable.service, service))

    if (location) conditions.push(eq(supplierLocationsTable.locationId, location.id))

    const result = await supplierBaseQuery.where(conditions.length > 0 ? and(...conditions) : undefined)
    return aggregateSupplierQueryResults(result)
  }

  static async getById(id: string) {
    const suppliers = await db.select().from(suppliersTable).where(eq(suppliersTable.id, id))
    return suppliers.length ? suppliers[0] : null
  }

  static async getByHandle(handle: string): Promise<SupplierWithUsers | null> {
    const result = await supplierBaseQuery.where(eq(suppliersTable.handle, handle))

    if (result.length === 0) {
      return null
    }

    const suppliers = aggregateSupplierQueryResults(result)
    const supplier = suppliers[0]
    const supplierUsers = await db.select().from(supplierUsersTable).where(eq(supplierUsersTable.supplierId, supplier.id))

    return {
      ...supplier,
      users: supplierUsers,
    }
  }

  static async create(admin: User | UserWithDetail, insertSupplierData: InsertSupplier): Promise<SupplierWithUsers> {
    const suppliers = await db.insert(suppliersTable).values(insertSupplierData).returning()
    const supplier = suppliers[0]

    // Define an admin for the supplier
    const insertSupplierUserData: InsertSupplierUser = {
      supplierId: supplier.id,
      userId: admin.id,
      role: SupplierRole.ADMIN,
    }

    const supplierUsers = await db.insert(supplierUsersTable).values(insertSupplierUserData).returning()

    return {
      ...supplier,
      users: supplierUsers,
      services: [],
      locations: [],
    }
  }
}

export default SupplierActions
