import { eq } from 'drizzle-orm'

import { db } from '@/db/connection'
import { SupplierRole } from '@/db/constants'
import * as s from '@/db/schema'
import * as t from '@/models/types'

export const supplierUsersModel = {
  getRawForSupplierId,
  getRawForUserId,
  createRawForSupplierId,
}

async function getRawForSupplierId(supplierId: string): Promise<t.SupplierUserRaw[]> {
  return await db.select().from(s.supplierUsers).where(eq(s.supplierUsers.supplierId, supplierId))
}

async function getRawForUserId(userId: string): Promise<t.SupplierUserRaw[]> {
  return await db.select().from(s.supplierUsers).where(eq(s.supplierUsers.userId, userId))
}

async function createRawForSupplierId(supplierId: string, users: { id: string; role: SupplierRole }[]): Promise<t.SupplierUserRaw[]> {
  const insertSupplierUserData: t.InsertSupplierUserRaw[] = users.map((user) => ({
    supplierId,
    userId: user.id,
    role: user.role,
  }))
  return await db.insert(s.supplierUsers).values(insertSupplierUserData).returning()
}
