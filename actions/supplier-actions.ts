import { db } from '@/db/db'
import {
  suppliers as suppliersTable,
  supplierUsers as supplierUsersTable,
  supplierLocations as supplierLocationsTable,
  locations as locationsTable,
} from '@/db/schema'
import { InsertSupplier, InsertSupplierUser, Supplier, SupplierRole, SupplierWithUsers } from '@/models/suppliers'
import { User, UserWithDetail } from '@/models/users'
import { eq } from 'drizzle-orm'

class SupplierActions {
  private supplier: Supplier

  constructor(supplier: Supplier) {
    this.supplier = supplier
  }

  static async getById(id: string) {
    const suppliers = await db.select().from(suppliersTable).where(eq(suppliersTable.id, id))
    return suppliers.length ? suppliers[0] : null
  }

  static async getByHandle(handle: string): Promise<SupplierWithUsers | null> {
    const result = await db
      .select()
      .from(suppliersTable)
      .where(eq(suppliersTable.handle, handle))
      .leftJoin(supplierUsersTable, eq(suppliersTable.id, supplierUsersTable.supplierId))
      .leftJoin(supplierLocationsTable, eq(suppliersTable.id, supplierLocationsTable.supplierId))
      .leftJoin(locationsTable, eq(supplierLocationsTable.locationId, locationsTable.id))

    if (result.length === 0) {
      return null
    }

    const supplier = result[0].suppliers
    const supplierUsers = result.map((r) => r.supplier_users).filter((user): user is NonNullable<typeof user> => user !== null)
    const supplierLocations = result.map((r) => r.locations).filter((location): location is NonNullable<typeof location> => location !== null)

    return {
      ...supplier,
      users: supplierUsers,
      locations: supplierLocations,
    }
  }
  // static async getByHandle(handle: string): Promise<SupplierWithUsers | null> {
  //   const result = await db
  //     .select()
  //     .from(suppliersTable)
  //     .where(eq(suppliersTable.handle, handle))
  //     .leftJoin(supplierUsersTable, eq(suppliersTable.id, supplierUsersTable.supplierId))

  //   if (result.length === 0) {
  //     return null
  //   }

  //   const supplier = result[0].suppliers
  //   const supplierUsers = result.map((r) => r.supplier_users).filter((user): user is NonNullable<typeof user> => user !== null)

  //   return {
  //     ...supplier,
  //     users: supplierUsers,
  //     locations: [],
  //   }
  // }

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
      locations: [],
    }
  }
}

export default SupplierActions
