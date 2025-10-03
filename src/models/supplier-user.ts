import { db } from '@/db/connection'
import { SupplierRole } from '@/db/constants'
import * as s from '@/db/schema'
import * as t from '@/models/types'
import { eq } from 'drizzle-orm'

export const supplierUsersModel = {
  getForSupplierId,
  createForSupplierId,
}

async function getForSupplierId(supplierId: string): Promise<t.SupplierUserRaw[]> {
  return await db.select().from(s.supplierUsers).where(eq(s.supplierUsers.supplierId, supplierId))
}

async function createForSupplierId(supplierId: string, users: { id: string; role: SupplierRole }[]): Promise<t.SupplierUserRaw[]> {
  const insertSupplierUserData: t.InsertSupplierUserRaw[] = users.map((user) => ({
    supplierId,
    userId: user.id,
    role: user.role,
  }))
  return await db.insert(s.supplierUsers).values(insertSupplierUserData).returning()
}
