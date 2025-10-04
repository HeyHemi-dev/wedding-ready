import { count, eq, inArray } from 'drizzle-orm'

import { db } from '@/db/connection'
import { Location } from '@/db/constants'
import * as s from '@/db/schema'
import * as t from '@/models/types'

export const supplierLocationsModel = {
  getAllWithSupplierCount,
  getMapBySupplierIds,
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

type SupplierLocationsMap = Map<string, Location[]>
async function getMapBySupplierIds(supplierIds: string[]): Promise<SupplierLocationsMap> {
  if (supplierIds.length === 0) return new Map()
  const result = await db.select().from(s.supplierLocations).where(inArray(s.supplierLocations.supplierId, supplierIds))
  return mapLocationsBySupplierId(result)
}

async function createForSupplierId({ supplierId, locations }: { supplierId: string; locations: Location[] }): Promise<t.SupplierLocationRaw[]> {
  const insertSupplierLocationData: t.InsertSupplierLocationRaw[] = locations.map((location) => ({
    supplierId,
    location,
  }))
  return await db.insert(s.supplierLocations).values(insertSupplierLocationData).returning()
}

function mapLocationsBySupplierId(supplierLocations: t.SupplierLocationRaw[]): SupplierLocationsMap {
  // We don't need to dedup locations because supplierId + location is the primary key
  const byId = new Map<string, Location[]>()
  for (const { supplierId, location } of supplierLocations) {
    const existing = byId.get(supplierId)
    if (!existing) {
      byId.set(supplierId, [location])
    } else {
      existing.push(location)
    }
  }
  return byId
}
