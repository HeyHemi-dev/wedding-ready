import { db } from '@/db/db'
import { suppliers as suppliersTable } from '@/db/schema'
import { InsertSupplier, Supplier } from '@/models/Suppliers'
import { User, UserWithDetail } from '@/models/Users'
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

  static async getByHandle(handle: string) {
    const suppliers = await db.select().from(suppliersTable).where(eq(suppliersTable.handle, handle))
    return suppliers.length ? suppliers[0] : null
  }

  static async create(user: User | UserWithDetail, insertSupplierData: InsertSupplier) {
    const suppliers = await db.insert(suppliersTable).values(insertSupplierData).returning()
    return suppliers[0]
  }
}

export default SupplierActions
