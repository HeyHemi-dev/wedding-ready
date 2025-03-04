import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { tiles } from '@/db/schema'

export type Tile = InferSelectModel<typeof tiles>
export type InsertTile = InferInsertModel<typeof tiles>
