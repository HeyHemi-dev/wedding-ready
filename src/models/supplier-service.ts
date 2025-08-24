import { count, eq, inArray } from 'drizzle-orm'

import { db } from '@/db/connection'
import { Service } from '@/db/constants'
import * as s from '@/db/schema'
import * as t from '@/models/types'

export const supplierServicesModel = {
  getAllWithSupplierCount,
  getForSupplierIds,
  createForSupplierId,
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

async function getForSupplierIds(supplierIds: string[]): Promise<{ supplierId: string; services: Service[] }[]> {
  if (supplierIds.length === 0) return []
  const result = await db.select().from(s.supplierServices).where(inArray(s.supplierServices.supplierId, supplierIds))
  return aggregateServicesBySupplierId(result)
}

async function createForSupplierId({ supplierId, services }: { supplierId: string; services: Service[] }): Promise<t.SupplierServiceRaw[]> {
  const insertSupplierServiceData: t.InsertSupplierServiceRaw[] = services.map((service) => ({
    supplierId,
    service,
  }))
  return await db.insert(s.supplierServices).values(insertSupplierServiceData).returning()
}

function aggregateServicesBySupplierId(supplierServices: t.SupplierServiceRaw[]): { supplierId: string; services: Service[] }[] {
  const byId = new Map<string, { supplierId: string; services: Service[] }>()
  for (const { supplierId, service } of supplierServices) {
    const existing = byId.get(supplierId)
    if (!existing) {
      byId.set(supplierId, { supplierId, services: [service] })
    } else {
      existing.services.push(service)
    }
  }
  return Array.from(byId.values())
}
