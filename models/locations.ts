import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { locations } from '@/db/schema'

export type Location = InferSelectModel<typeof locations>
export type InsertLocation = InferInsertModel<typeof locations>
