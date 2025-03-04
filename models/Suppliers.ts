import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { suppliers } from '@/db/schema'

export type Supplier = InferSelectModel<typeof suppliers>
export type InsertSupplier = InferInsertModel<typeof suppliers>
