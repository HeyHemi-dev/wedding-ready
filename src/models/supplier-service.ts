import { count, eq, inArray } from 'drizzle-orm'

import { db } from '@/db/connection'
import { Service } from '@/db/constants'
import * as s from '@/db/schema'
import * as t from '@/models/types'

export const supplierServicesModel = {
  getRawForSupplierId,
  getAllWithSupplierCount,
  getMapBySupplierIds,
  createForSupplierId,
}

async function getRawForSupplierId(supplierId: string): Promise<t.SupplierServiceRaw[]> {
  return await db.select().from(s.supplierServices).where(eq(s.supplierServices.supplierId, supplierId))
}

async function getAllWithSupplierCount(): Promise<{ service: Service; supplierCount: number }[]> {
  const result = await db
    .select({
      service: s.supplierServices.service,
      supplierCount: count(s.suppliers.id),
    })
    .from(s.suppliers)
    .innerJoin(s.supplierServices, eq(s.suppliers.id, s.supplierServices.supplierId))
    .groupBy(s.supplierServices.service)
  return result
}

type SupplierServicesMap = Map<string, Service[]>
async function getMapBySupplierIds(supplierIds: string[]): Promise<SupplierServicesMap> {
  if (supplierIds.length === 0) return new Map()
  const result = await db.select().from(s.supplierServices).where(inArray(s.supplierServices.supplierId, supplierIds))
  return mapServicesBySupplierId(result)
}

async function createForSupplierId({ supplierId, services }: { supplierId: string; services: Service[] }): Promise<t.SupplierServiceRaw[]> {
  const insertSupplierServiceData: t.InsertSupplierServiceRaw[] = services.map((service) => ({
    supplierId,
    service,
  }))
  return await db.insert(s.supplierServices).values(insertSupplierServiceData).returning()
}

function mapServicesBySupplierId(supplierServices: t.SupplierServiceRaw[]): SupplierServicesMap {
  // We don't need to dedup services because supplierId + service is the primary key
  const byId = new Map<string, Service[]>()
  for (const { supplierId, service } of supplierServices) {
    const existing = byId.get(supplierId)
    if (!existing) {
      byId.set(supplierId, [service])
    } else {
      existing.push(service)
    }
  }
  return byId
}
