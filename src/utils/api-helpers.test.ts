import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { FeedGetRequest, feedGetRequestSchema } from '@/app/api/feed/types'
import { supplierTilesGetRequestSchema, SupplierTilesGetRequest } from '@/app/api/suppliers/[id]/tiles/types'
import { supplierSearchGetRequestSchema, SupplierSearchGetRequest } from '@/app/api/suppliers/search/types'
import { userTilesGetRequestSchema, UserTilesGetRequest } from '@/app/api/users/[id]/tiles/types'
import { TEST_ID } from '@/testing/scene'

import { buildQueryParams, parseQueryParams } from './api-helpers'

const URL_BASE = 'https://wedding-ready.nz/api' as const

describe('buildQueryParams', () => {
  it('should build query string from multiple parameters', () => {
    // Arrange
    const params = {
      page: '1',
      limit: '10',
      search: 'test',
    }

    // Act
    const result = buildQueryParams(params)

    // Assert
    expect(result).toBe('?page=1&limit=10&search=test')
  })

  it('should exclude undefined values from query string', () => {
    // Arrange
    const params = {
      page: '1',
      limit: undefined,
      search: 'test',
    }

    // Act
    const result = buildQueryParams(params)

    // Assert
    expect(result).toBe('?page=1&search=test')
  })

  it('should handle empty params object', () => {
    // Arrange
    const params = {}

    // Act
    const result = buildQueryParams(params)

    // Assert
    expect(result).toBe('?')
  })

  it('should handle single parameter', () => {
    // Arrange
    const params = {
      page: '1',
    }

    // Act
    const result = buildQueryParams(params)

    // Assert
    expect(result).toBe('?page=1')
  })

  it('should handle all undefined values', () => {
    // Arrange
    const params = {
      page: undefined,
      limit: undefined,
    }

    // Act
    const result = buildQueryParams(params)

    // Assert
    expect(result).toBe('?')
  })

  it('should encode special characters in values', () => {
    // Arrange
    const params = {
      search: 'hello world',
      filter: 'test&value',
    }

    // Act
    const result = buildQueryParams(params)

    // Assert
    expect(result).toBe('?search=hello+world&filter=test%26value')
  })

  it('should handle empty string values', () => {
    // Arrange
    const params = {
      page: '',
      limit: '10',
    }

    // Act
    const result = buildQueryParams(params)

    // Assert
    expect(result).toBe('?page=&limit=10')
  })
})

describe('parseQueryParams', () => {
  it('should parse query parameters with valid schema', () => {
    // Arrange
    const schema = z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
    })
    const params = {
      page: '1',
      limit: '10',
      search: 'test',
    } satisfies z.infer<typeof schema>
    const url = new URL(`${URL_BASE}${buildQueryParams(params)}`)

    // Act
    const result = parseQueryParams(url, schema)

    // Assert
    expect(result).toEqual({
      page: '1',
      limit: '10',
      search: 'test',
    })
  })

  it('should set undefined for missing query parameters', () => {
    // Arrange
    const schema = z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
    })
    const params = {
      page: '1',
    } satisfies z.infer<typeof schema>
    const url = new URL(`${URL_BASE}${buildQueryParams(params)}`)

    // Act
    const result = parseQueryParams(url, schema)

    // Assert
    expect(result).toEqual({
      page: '1',
      limit: undefined,
      search: undefined,
    })
  })

  it('should handle empty query string', () => {
    // Arrange
    const schema = z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    const params = {} satisfies z.infer<typeof schema>
    const url = new URL(`${URL_BASE}${buildQueryParams(params)}`)

    // Act
    const result = parseQueryParams(url, schema)

    // Assert
    expect(result).toEqual({
      page: undefined,
      limit: undefined,
    })
  })

  it('should validate required fields and throw on missing values', () => {
    // Arrange
    const schema = z.object({
      page: z.string(),
      limit: z.string(),
    })
    const params = {
      page: '1',
    }
    const url = new URL(`${URL_BASE}${buildQueryParams(params)}`)

    // Act & Assert
    expect(() => parseQueryParams(url, schema)).toThrow()
  })

  it('should handle Zod transformations', () => {
    // Arrange
    const schema = z.object({
      page: z.string().transform((val) => parseInt(val, 10)),
      limit: z.string().transform((val) => parseInt(val, 10)),
    })
    const params = {
      page: '1',
      limit: '10',
    }
    const url = new URL(`${URL_BASE}${buildQueryParams(params)}`)

    // Act
    const result = parseQueryParams(url, schema)

    // Assert
    expect(result).toEqual({
      page: 1,
      limit: 10,
    })
  })

  it('should handle default values in schema', () => {
    // Arrange
    const schema = z.object({
      page: z.string().default('1'),
      limit: z.string().default('10'),
    })
    const params = {}
    const url = new URL(`${URL_BASE}${buildQueryParams(params)}`)

    // Act
    const result = parseQueryParams(url, schema)

    // Assert
    expect(result).toEqual({
      page: '1',
      limit: '10',
    })
  })

  it('should handle boolean-like string values', () => {
    // Arrange
    const schema = z.object({
      active: z.string().optional(),
      published: z.string().optional(),
    })
    const params = {
      active: 'true',
      published: 'false',
    }
    const url = new URL(`${URL_BASE}${buildQueryParams(params)}`)

    // Act
    const result = parseQueryParams(url, schema)

    // Assert
    expect(result).toEqual({ active: 'true', published: 'false' })
  })

  it('should handle URL-encoded values', () => {
    // Arrange
    const schema = z.object({
      search: z.string().optional(),
      filter: z.string().optional(),
    })
    const params = {
      search: 'hello world',
      filter: 'test&value',
    }
    const url = new URL(`${URL_BASE}${buildQueryParams(params)}`)

    // Act
    const result = parseQueryParams(url, schema)

    // Assert
    expect(result).toEqual({
      search: 'hello world',
      filter: 'test&value',
    })
  })

  it('should only parse parameters defined in schema', () => {
    // Arrange
    const schema = z.object({
      page: z.string().optional(),
    })
    const params = {
      page: '1',
      limit: '10',
      extra: 'value',
    }
    const url = new URL(`${URL_BASE}${buildQueryParams(params)}`)

    // Act
    const result = parseQueryParams(url, schema)

    // Assert
    expect(result).toEqual({
      page: '1',
    })
  })

  it('should handle empty string values', () => {
    // Arrange
    const schema = z.object({
      search: z.string().optional(),
      filter: z.string().optional(),
    })
    const params = {
      search: '',
      filter: 'test',
    }
    const url = new URL(`${URL_BASE}${buildQueryParams(params)}`)

    // Act
    const result = parseQueryParams(url, schema)

    // Assert
    expect(result).toEqual({
      search: '',
      filter: 'test',
    })
  })

  it('should throw validation error for invalid schema values', () => {
    // Arrange
    const schema = z.object({
      page: z.string().regex(/^\d+$/),
      limit: z.string().optional(),
    })
    const params = {
      page: 'abc',
      limit: '10',
    }
    const url = new URL(`${URL_BASE}${buildQueryParams(params)}`)

    // Act & Assert
    expect(() => parseQueryParams(url, schema)).toThrow()
  })
})

describe('route schema integration', () => {
  describe('feedGetRequestSchema', () => {
    it('should handle round trip with positive integers', () => {
      // Arrange
      const valid = { pageSize: 5 } satisfies FeedGetRequest

      // Act
      const params = buildQueryParams({ ...valid, pageSize: valid.pageSize.toString() })
      const url = new URL(`${URL_BASE}${params}`)
      const result = parseQueryParams(url, feedGetRequestSchema)

      // Assert
      expect(result).toEqual(valid)
    })
    it('should handle round trip with negative integers', () => {
      // Arrange
      const valid = { pageSize: -5 } satisfies FeedGetRequest

      // Act & Assert
      const params = buildQueryParams({ pageSize: valid.pageSize.toString() })
      const url = new URL(`${URL_BASE}${params}`)
      expect(() => parseQueryParams(url, feedGetRequestSchema)).toThrow()
    })
    it('should handle round trip with not a number', () => {
      // Arrange
      const valid = { pageSize: 'not-a-number' }

      // Act & Assert
      const params = buildQueryParams(valid)
      const url = new URL(`${URL_BASE}${params}`)
      expect(() => parseQueryParams(url, feedGetRequestSchema)).toThrow()
    })
  })

  describe('supplierSearchGetRequestSchema', () => {
    it('should handle round trip with valid query', () => {
      // Arrange
      const valid = {
        q: 'Test name',
      } satisfies SupplierSearchGetRequest

      // Act
      const params = buildQueryParams(valid)
      const url = new URL(`${URL_BASE}${params}`)
      const result = parseQueryParams(url, supplierSearchGetRequestSchema)

      // Assert
      expect(result).toEqual(valid)
    })
    it('should handle round trip with empty query', () => {
      // Arrange
      const valid = {
        q: '',
      } satisfies SupplierSearchGetRequest

      // Act
      const params = buildQueryParams(valid)
      const url = new URL(`${URL_BASE}${params}`)
      const result = parseQueryParams(url, supplierSearchGetRequestSchema)

      // Assert
      expect(result).toEqual(valid)
    })
  })

  describe('supplierTilesGetRequestSchema', () => {
    it('should handle round trip with valid authUserId', () => {
      // Arrange
      const valid = {
        authUserId: 'user-1',
      } satisfies SupplierTilesGetRequest

      // Act
      const params = buildQueryParams(valid)
      const url = new URL(`${URL_BASE}${params}`)
      const result = parseQueryParams(url, supplierTilesGetRequestSchema)

      // Assert
      expect(result).toEqual(valid)
    })
  })
  describe('userTilesGetRequestSchema', () => {
    it('should handle round trip with valid authUserId', () => {
      // Arrange
      const valid = {
        authUserId: TEST_ID,
      } satisfies UserTilesGetRequest

      // Act
      const params = buildQueryParams(valid)
      const url = new URL(`${URL_BASE}${params}`)
      const result = parseQueryParams(url, userTilesGetRequestSchema)

      // Assert
      expect(result).toEqual(valid)
    })
  })
})
