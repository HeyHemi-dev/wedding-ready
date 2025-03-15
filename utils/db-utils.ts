import { SQL, sql } from 'drizzle-orm'

/**
 * Creates a batch update object with CASE statements for each field.
 * Sets the updatedAt field to the current timestamp if it exists
 * @param items Array of objects to update
 * @param idField The name of the ID field in the objects
 * @param table The Drizzle table object
 * @returns An object with CASE statements for each field that can be passed to .set()
 * @example example return object
 * ```ts
 *     {title: SQL`CASE
 *       WHEN tiles.id = 'uuid1' THEN 'First Tile Title'
 *       WHEN tiles.id = 'uuid2' THEN 'Second Tile Title'
 *       ELSE tiles.title
 *     END`,
 *     ...other keys}
 * ```
 */
export function createBatchUpdateObject<T extends Record<string, any>>(items: T[], idField: keyof T, table: Record<string, any>): Record<string, SQL> {
  if (items.length === 0) {
    return {}
  }

  const exampleItem = items[0]
  const updateObject: Record<string, SQL> = {}

  if ('updatedAt' in exampleItem) {
    updateObject['updatedAt'] = sql`CURRENT_TIMESTAMP`
  }

  // TODO: handle fields that should not be updated.
  // TODO: #Lachie maybe updatedAt should be the responsibility of the frontend to set? For example, if we have an updatedBy field in the future, this would have to be set by the front end, because the database will have no way to know... right?
  for (const key of Object.keys(exampleItem) as Array<keyof T>) {
    // Skip the id field since we're using it for the WHERE clause
    // Also skip updatedAt since we've already handled it
    if (key === idField || key === 'updatedAt') continue

    // Create a new case statement for each field
    let caseStatement = sql`CASE`

    for (const item of items) {
      if (item[key] !== undefined) {
        caseStatement = sql`${caseStatement} WHEN ${table[String(idField)]} = ${item[idField]} THEN ${item[key]}`
      }
    }

    caseStatement = sql`${caseStatement} ELSE ${table[String(key)]} END`
    updateObject[String(key)] = caseStatement
  }

  return updateObject
}
