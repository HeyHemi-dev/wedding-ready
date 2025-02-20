import { pgTable, bigserial, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const notes = pgTable("notes", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	title: text(),
});
