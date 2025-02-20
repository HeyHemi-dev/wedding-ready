import { pgTable, bigserial, text } from 'drizzle-orm/pg-core'

export const notes = pgTable('notes', {
  id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
  title: text(),
})
