import { db } from '@/db/connection'
import * as s from '@/db/schema'
import * as t from '@/models/types'
import { Location } from '@/db/constants'
import { count, eq } from 'drizzle-orm'

export const supplierLocationsModel = {
  getAllWithSupplierCount,
  createForSupplierId,
}

async function getAllWithSupplierCount(): Promise<{ location: Location; supplierCount: number }[]> {
  const result = await db
    .select({
      location: s.supplierLocations.location,
      supplierCount: count(s.suppliers.id),
    })
    .from(s.suppliers)
    .innerJoin(s.supplierLocations, eq(s.suppliers.id, s.supplierLocations.supplierId))
    .groupBy(s.supplierLocations.location)

  return result
}

async function createForSupplierId({ supplierId, locations }: { supplierId: string; locations: Location[] }): Promise<t.SupplierLocationRaw[]> {
  const insertSupplierLocationData: t.InsertSupplierLocationRaw[] = locations.map((location) => ({
    supplierId,
    location,
  }))
  return await db.insert(s.supplierLocations).values(insertSupplierLocationData).returning()
}
