import { z } from 'zod'

import { OPERATION_ERROR } from '@/app/_types/errors'

export const cursorDataSchema = z.object({
  tileId: z.string().uuid(),
})
export type CursorData = z.infer<typeof cursorDataSchema>

/**
 * Encodes a cursor (tileId) into a URL-safe string.
 * @param tileId - The unique identifier of the last tile returned.
 * @returns A Base64-encoded string representing the cursor.
 */
export function encodeCursor(cursorData: CursorData): string {
  const json = JSON.stringify(cursorData)
  return Buffer.from(json).toString('base64url')
}

/**
 * Decodes a cursor string back into its components (tileId).
 *
 * Note: This function should only be called when a cursor is provided (not null/undefined).
 *
 * @param cursor - The Base64-encoded cursor string. Must be a non-null string.
 * @returns An object containing tileId.
 * @throws Error if the cursor format is invalid.
 */
export function decodeCursor(cursor: string): CursorData {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf-8')
    const parsed = JSON.parse(json)

    const validated = cursorDataSchema.parse(parsed)
    return validated
  } catch (error) {
    console.error(error)
    throw OPERATION_ERROR.VALIDATION_ERROR()
  }
}
