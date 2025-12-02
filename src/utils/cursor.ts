import { OPERATION_ERROR } from '@/app/_types/errors'

/**
 * Encodes a cursor tuple (score, createdAt, tileId) into a URL-safe string.
 * @param score - The composite score of the tile.
 * @param createdAt - The creation timestamp of the tile.
 * @param tileId - The unique identifier of the tile.
 * @returns A Base64-encoded string representing the cursor.
 */
export function encodeCursor(score: number, createdAt: Date, tileId: string): string {
  const cursorData = {
    score,
    createdAt: createdAt.toISOString(),
    tileId,
  }
  const json = JSON.stringify(cursorData)
  return Buffer.from(json).toString('base64url')
}

/**
 * Decodes a cursor string back into its components (score, createdAt, tileId).
 * @param cursor - The Base64-encoded cursor string.
 * @returns An object containing score, createdAt (as Date), and tileId.
 * @throws Error if the cursor format is invalid.
 */
export function decodeCursor(cursor: string): { score: number; createdAt: Date; tileId: string } {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf-8')
    const parsed = JSON.parse(json) as { score: number; createdAt: string; tileId: string }

    if (typeof parsed.score !== 'number' || typeof parsed.createdAt !== 'string' || typeof parsed.tileId !== 'string') {
      throw OPERATION_ERROR.VALIDATION_ERROR('Invalid cursor format: missing required fields')
    }

    const createdAt = new Date(parsed.createdAt)
    if (isNaN(createdAt.getTime())) {
      throw OPERATION_ERROR.VALIDATION_ERROR('Invalid cursor format: invalid date')
    }

    return {
      score: parsed.score,
      createdAt,
      tileId: parsed.tileId,
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid cursor format')) {
      throw error
    }
    throw OPERATION_ERROR.VALIDATION_ERROR('Invalid cursor format: unable to decode')
  }
}
