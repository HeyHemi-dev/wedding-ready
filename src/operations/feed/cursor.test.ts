import { describe, expect, it } from 'vitest'

import { decodeCursor, encodeCursor } from './cursor'

describe('cursor encoding/decoding', () => {
  describe('encodeCursor', () => {
    it('should encode a cursor tuple into a Base64 string', () => {
      const score = 0.85
      const createdAt = new Date('2024-01-15T10:30:00Z')
      const tileId = '123e4567-e89b-4123-a456-426614174000'

      const encoded = encodeCursor({ score, createdAt, tileId })

      expect(encoded).toBeDefined()
      expect(typeof encoded).toBe('string')
      expect(encoded.length).toBeGreaterThan(0)
      // Base64url doesn't contain +, /, or = padding
      expect(encoded).not.toContain('+')
      expect(encoded).not.toContain('/')
    })

    it('should produce different encodings for different inputs', () => {
      const date1 = new Date('2024-01-15T10:30:00Z')
      const date2 = new Date('2024-01-16T10:30:00Z')

      const encoded1 = encodeCursor({ score: 0.85, createdAt: date1, tileId: '123e4567-e89b-4123-a456-426614174000' })
      const encoded2 = encodeCursor({ score: 0.85, createdAt: date2, tileId: '223e4567-e89b-4123-a456-426614174000' })

      expect(encoded1).not.toBe(encoded2)
    })
  })

  describe('decodeCursor', () => {
    it('should decode a valid cursor back to its components', () => {
      const score = 0.85
      const createdAt = new Date('2024-01-15T10:30:00Z')
      const tileId = '123e4567-e89b-4123-a456-426614174000'

      const encoded = encodeCursor({ score, createdAt, tileId })
      const decoded = decodeCursor(encoded)

      expect(decoded.score).toBe(score)
      expect(decoded.createdAt.getTime()).toBe(createdAt.getTime())
      expect(decoded.tileId).toBe(tileId)
    })

    it('should handle round-trip encoding/decoding', () => {
      const original = {
        score: 0.123456789,
        createdAt: new Date('2024-12-25T23:59:59.999Z'),
        tileId: '00000000-0000-4000-8000-000000000000',
      }

      const encoded = encodeCursor({ score: original.score, createdAt: original.createdAt, tileId: original.tileId })
      const decoded = decodeCursor(encoded)

      expect(decoded.score).toBe(original.score)
      expect(decoded.createdAt.getTime()).toBe(original.createdAt.getTime())
      expect(decoded.tileId).toBe(original.tileId)
    })

    it('should throw an error for invalid Base64 format', () => {
      expect(() => decodeCursor('invalid-base64!!!')).toThrow('Invalid cursor format')
    })

    it('should throw an error for invalid JSON structure', () => {
      const invalidJson = Buffer.from('not valid json').toString('base64url')
      expect(() => decodeCursor(invalidJson)).toThrow('Invalid cursor format')
    })

    it('should throw an error for missing required fields', () => {
      const incompleteData = Buffer.from(JSON.stringify({ score: 0.5 })).toString('base64url')
      expect(() => decodeCursor(incompleteData)).toThrow('Invalid cursor format')
    })

    it('should throw an error for invalid date format', () => {
      const invalidDate = Buffer.from(JSON.stringify({ score: 0.5, createdAt: 'not-a-date', tileId: '123e4567-e89b-4123-a456-426614174000' })).toString('base64url')
      expect(() => decodeCursor(invalidDate)).toThrow('Invalid cursor format')
    })

    it('should throw an error for wrong field types', () => {
      const wrongTypes = Buffer.from(JSON.stringify({ score: 'not-a-number', createdAt: '2024-01-15T10:30:00Z', tileId: '123e4567-e89b-4123-a456-426614174000' })).toString('base64url')
      expect(() => decodeCursor(wrongTypes)).toThrow('Invalid cursor format')
    })

    it('should handle edge case values', () => {
      const edgeCases = [
        { score: 0, createdAt: new Date('1970-01-01T00:00:00Z'), tileId: '00000000-0000-4000-8000-000000000000' },
        { score: 999.999, createdAt: new Date('2099-12-31T23:59:59Z'), tileId: 'ffffffff-ffff-4fff-bfff-ffffffffffff' },
        { score: -0.5, createdAt: new Date(), tileId: '123e4567-e89b-4123-a456-426614174000' },
      ]

      edgeCases.forEach(({ score, createdAt, tileId }) => {
        const encoded = encodeCursor({ score, createdAt, tileId })
        const decoded = decodeCursor(encoded)
        expect(decoded.score).toBe(score)
        expect(decoded.createdAt.getTime()).toBe(createdAt.getTime())
        expect(decoded.tileId).toBe(tileId)
      })
    })

    it('should throw an error for invalid UUID format', () => {
      const invalidUUID = Buffer.from(JSON.stringify({ score: 0.5, createdAt: '2024-01-15T10:30:00Z', tileId: 'not-a-uuid' })).toString('base64url')
      expect(() => decodeCursor(invalidUUID)).toThrow('Invalid cursor format')
    })
  })
})
