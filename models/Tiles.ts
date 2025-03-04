import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { tiles, savedTiles, stacks, stackTiles, tileSuppliers } from '@/db/schema'

export type Tile = InferSelectModel<typeof tiles>
export type InsertTile = InferInsertModel<typeof tiles>

export type SavedTile = InferSelectModel<typeof savedTiles>
export type InsertSavedTile = InferInsertModel<typeof savedTiles>

export type TileSupplier = InferSelectModel<typeof tileSuppliers>
export type InsertTileSupplier = InferInsertModel<typeof tileSuppliers>
