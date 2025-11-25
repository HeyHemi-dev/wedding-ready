import { eq, or, ilike } from 'drizzle-orm'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { db } from '@/db/connection'
import { Service, Location } from '@/db/constants'
import * as schema from '@/db/schema'
import * as t from '@/models/types'
import { emptyStringToNull } from '@/utils/empty-strings'

export const supplierModel = {
  getRawById,
  getRawByHandle,
  getAllRawForLocation,
  getAllRawForService,
  createRaw,
  updateRaw,
  isHandleAvailable,
  search,
}

async function getRawById(id: string): Promise<t.SupplierRaw | null> {
  const suppliersRaw = await db.select().from(schema.suppliers).where(eq(schema.suppliers.id, id))
  if (suppliersRaw.length === 0) return null
  return suppliersRaw[0]
}

async function getRawByHandle(handle: string): Promise<t.SupplierRaw | null> {
  const suppliersRaw = await db.select().from(schema.suppliers).where(eq(schema.suppliers.handle, handle))
  if (suppliersRaw.length === 0) return null
  return suppliersRaw[0]
}

async function getAllRawForLocation(location: Location): Promise<t.SupplierRaw[]> {
  return db
    .selectDistinct({
      ...schema.supplierColumns,
    })
    .from(schema.suppliers)
    .innerJoin(schema.supplierLocations, eq(schema.suppliers.id, schema.supplierLocations.supplierId))
    .where(eq(schema.supplierLocations.location, location))
}

async function getAllRawForService(service: Service): Promise<t.SupplierRaw[]> {
  return db
    .selectDistinct({
      ...schema.supplierColumns,
    })
    .from(schema.suppliers)
    .innerJoin(schema.supplierServices, eq(schema.suppliers.id, schema.supplierServices.supplierId))
    .where(eq(schema.supplierServices.service, service))
}

async function createRaw(insertSupplierData: t.InsertSupplierRaw): Promise<t.SupplierRaw> {
  const suppliersRaw = await db.insert(schema.suppliers).values(safeInsertSupplierRaw(insertSupplierData)).returning()
  return suppliersRaw[0]
}

async function updateRaw(supplierId: string, setSupplierData: t.SetSupplierRaw): Promise<t.SupplierRaw> {
  const suppliersRaw = await db.update(schema.suppliers).set(safeSetSupplierRaw(setSupplierData)).where(eq(schema.suppliers.id, supplierId)).returning()
  if (suppliersRaw.length === 0) throw OPERATION_ERROR.RESOURCE_CONFLICT()
  return suppliersRaw[0]
}

async function isHandleAvailable(handle: string): Promise<boolean> {
  const suppliersRaw = await db.select().from(schema.suppliers).where(eq(schema.suppliers.handle, handle))
  return suppliersRaw.length === 0
}

async function search(query: string): Promise<t.SupplierRaw[]> {
  const suppliersRaw = await db
    .select()
    .from(schema.suppliers)
    .where(or(ilike(schema.suppliers.name, `%${query}%`), ilike(schema.suppliers.handle, `%${query}%`)))
    .limit(10)

  return suppliersRaw
}

function safeInsertSupplierRaw(data: t.InsertSupplierRaw): t.InsertSupplierRaw {
  const now = new Date()
  return {
    createdAt: now,
    updatedAt: now,
    name: data.name,
    handle: data.handle,
    handleUpdatedAt: now,
    websiteUrl: emptyStringToNull(data.websiteUrl),
    description: emptyStringToNull(data.description),
    createdByUserId: data.createdByUserId,
  } satisfies t.InsertSupplierRaw
}

function safeSetSupplierRaw(data: t.SetSupplierRaw): t.SetSupplierRaw {
  const now = new Date()
  return {
    updatedAt: now,
    name: data.name,
    handle: data.handle,
    handleUpdatedAt: data.handle ? now : undefined,
    websiteUrl: emptyStringToNull(data.websiteUrl),
    description: emptyStringToNull(data.description),
  } satisfies t.SetSupplierRaw
}
