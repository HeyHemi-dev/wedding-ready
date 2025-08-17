import { db } from '@/db/connection'
import { SupplierRole } from '@/db/constants'
import * as s from '@/db/schema'
import * as t from '@/models/types'

export const supplierUsersModel = {
  createForSupplierId,
}

async function createForSupplierId({ supplierId, users }: { supplierId: string; users: { id: string; role: SupplierRole }[] }): Promise<t.SupplierUserRaw[]> {
  const insertSupplierUserData: t.InsertSupplierUserRaw[] = users.map((user) => ({
    supplierId,
    userId: user.id,
    role: user.role,
  }))
  return await db.insert(s.supplierUsers).values(insertSupplierUserData).returning()
}
