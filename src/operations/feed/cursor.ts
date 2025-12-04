import { z } from 'zod'

import { OPERATION_ERROR } from '@/app/_types/errors'

export const cursorDataSchema = z.object({
  score: z.number(),
  createdAt: z.string().datetime(),
  tileId: z.string().uuid(),
})

export type CursorData = {
  score: number
  createdAt: Date
  tileId: string
}

/**
 * Encodes a cursor tuple (score, createdAt, tileId) into a URL-safe string.
 * @param score - The composite score of the tile.
 * @param createdAt - The creation timestamp of the tile.
 * @param tileId - The unique identifier of the tile.
 * @returns A Base64-encoded string representing the cursor.
 */
export function encodeCursor(cursorData: CursorData): string {
  const json = JSON.stringify(cursorData)
  return Buffer.from(json).toString('base64url')
}

/**
 * Decodes a cursor string back into its components (score, createdAt, tileId).
 *
 * Note: This function should only be called when a cursor is provided (not null/undefined).
 *
 * @param cursor - The Base64-encoded cursor string. Must be a non-null string.
 * @returns An object containing score, createdAt (as Date), and tileId.
 * @throws Error if the cursor format is invalid.
 */
export function decodeCursor(cursor: string): CursorData {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf-8')
    const parsed = JSON.parse(json)

    // Validate using Zod schema
    const validated = cursorDataSchema.parse(parsed)

    // Convert createdAt string to Date
    const createdAt = new Date(validated.createdAt)
    if (isNaN(createdAt.getTime())) {
      throw OPERATION_ERROR.VALIDATION_ERROR('Invalid cursor format: invalid date')
    }

    return {
      score: validated.score,
      createdAt,
      tileId: validated.tileId,
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid cursor format')) {
      throw error
    }
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      throw OPERATION_ERROR.VALIDATION_ERROR(`Invalid cursor format: ${error.errors.map((e) => e.message).join(', ')}`)
    }
    throw OPERATION_ERROR.VALIDATION_ERROR('Invalid cursor format: unable to decode')
  }
}
