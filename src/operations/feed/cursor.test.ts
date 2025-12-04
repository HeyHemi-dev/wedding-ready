import { describe, expect, it } from 'vitest'
import { TEST_ID, TEST_ID_0, TEST_ID_F } from '@/testing/scene'
import { ERROR_MESSAGE } from '@/app/_types/errors'

import { decodeCursor, encodeCursor } from './cursor'

const CURSOR_DATA = {
  score: 0.85,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  tileId: TEST_ID,
}

describe('cursor encoding/decoding', () => {
  describe('encodeCursor', () => {
    it('should encode a cursor tuple into a Base64 string', () => {
      const encoded = encodeCursor(CURSOR_DATA)

      expect(encoded).toBeDefined()
      expect(typeof encoded).toBe('string')
      expect(encoded.length).toBeGreaterThan(0)
      // Base64url doesn't contain +, /, or = padding
      expect(encoded).not.toContain('+')
      expect(encoded).not.toContain('/')
    })

    it('should produce different encodings for different inputs', () => {
      const encoded1 = encodeCursor(CURSOR_DATA)
      const encoded2 = encodeCursor({ score: CURSOR_DATA.score, createdAt: new Date('2024-01-16T10:30:00Z'), tileId: CURSOR_DATA.tileId })
      const encoded3 = encodeCursor({ score: 0.5, createdAt: CURSOR_DATA.createdAt, tileId: CURSOR_DATA.tileId })

      expect(encoded1).not.toBe(encoded2)
      expect(encoded1).not.toBe(encoded3)
      expect(encoded2).not.toBe(encoded3)
    })
  })

  describe('decodeCursor', () => {
    it('should decode a valid cursor back to its components', () => {
      const encoded = encodeCursor(CURSOR_DATA)
      const decoded = decodeCursor(encoded)

      expect(decoded.score).toBe(CURSOR_DATA.score)
      expect(decoded.createdAt.getTime()).toBe(CURSOR_DATA.createdAt.getTime())
      expect(decoded.tileId).toBe(CURSOR_DATA.tileId)
    })

    it('should throw an error for invalid Base64 format', () => {
      expect(() => decodeCursor('invalid-base64!!!')).toThrow(ERROR_MESSAGE.VALIDATION_ERROR)
    })

    it('should throw an error for invalid JSON structure', () => {
      const invalidJson = Buffer.from('not valid json').toString('base64url')
      expect(() => decodeCursor(invalidJson)).toThrow(ERROR_MESSAGE.VALIDATION_ERROR)
    })

    it('should throw an error for missing required fields', () => {
      const incompleteData = Buffer.from(JSON.stringify({ score: CURSOR_DATA.score })).toString('base64url')
      expect(() => decodeCursor(incompleteData)).toThrow(ERROR_MESSAGE.VALIDATION_ERROR)
    })

    it('should throw an error for invalid date format', () => {
      const invalidDate = Buffer.from(JSON.stringify({ score: CURSOR_DATA.score, createdAt: 'not-a-date', tileId: CURSOR_DATA.tileId })).toString('base64url')
      expect(() => decodeCursor(invalidDate)).toThrow(ERROR_MESSAGE.VALIDATION_ERROR)
    })

    it('should throw an error for invalid UUID format', () => {
      const invalidUUID = Buffer.from(JSON.stringify({ score: CURSOR_DATA.score, createdAt: CURSOR_DATA.createdAt, tileId: 'not-a-uuid' })).toString(
        'base64url'
      )
      expect(() => decodeCursor(invalidUUID)).toThrow(ERROR_MESSAGE.VALIDATION_ERROR)
    })

    it('should throw an error for wrong field types', () => {
      const wrongTypes = Buffer.from(JSON.stringify({ score: 'not-a-number', createdAt: CURSOR_DATA.createdAt, tileId: CURSOR_DATA.tileId })).toString(
        'base64url'
      )
      expect(() => decodeCursor(wrongTypes)).toThrow(ERROR_MESSAGE.VALIDATION_ERROR)
    })

    it('should handle edge case values', () => {
      const edgeCases = [
        { score: 0, createdAt: new Date('1970-01-01T00:00:00Z'), tileId: TEST_ID },
        { score: 999.999, createdAt: new Date('2099-12-31T23:59:59Z'), tileId: TEST_ID_F },
        { score: -0.5, createdAt: new Date(), tileId: TEST_ID_0 },
      ]

      edgeCases.forEach(({ score, createdAt, tileId }) => {
        const encoded = encodeCursor({ score, createdAt, tileId })
        const decoded = decodeCursor(encoded)
        expect(decoded.score).toBe(score)
        expect(decoded.createdAt.getTime()).toBe(createdAt.getTime())
        expect(decoded.tileId).toBe(tileId)
      })
    })
  })
})
