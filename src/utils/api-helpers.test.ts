import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import {
  FeedQuery,
  feedQuerySchema,
  TileCreditForm,
  tileCreditFormSchema,
  TileSaveState,
  tileSaveStateSchema,
  TileUpload,
  tileUploadSchema,
} from '@/app/_types/validation-schema'

import { supplierSearchGetRequestSchema, SupplierSearchGetRequest } from '@/app/api/suppliers/search/route'
import { LOCATIONS, SERVICES } from '@/db/constants'

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
    const url = new URL(`${URL_BASE}?page=1&limit=10&search=test`)

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
    const url = new URL(`${URL_BASE}?page=1`)

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
    const url = new URL(`${URL_BASE}`)

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
    const url = new URL(`${URL_BASE}?page=1`)

    // Act & Assert
    expect(() => parseQueryParams(url, schema)).toThrow()
  })

  it('should handle Zod transformations', () => {
    // Arrange
    const schema = z.object({
      page: z.string().transform((val) => parseInt(val, 10)),
      limit: z.string().transform((val) => parseInt(val, 10)),
    })
    const url = new URL(`${URL_BASE}?page=1&limit=10`)

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
    const url = new URL(`${URL_BASE}`)

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
    const url = new URL(`${URL_BASE}?active=true&published=false`)

    // Act
    const result = parseQueryParams(url, schema)

    // Assert
    expect(result).toEqual({
      active: 'true',
      published: 'false',
    })
  })

  it('should handle URL-encoded values', () => {
    // Arrange
    const schema = z.object({
      search: z.string().optional(),
      filter: z.string().optional(),
    })
    const url = new URL(`${URL_BASE}?search=hello+world&filter=test%26value`)

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
    const url = new URL(`${URL_BASE}?page=1&limit=10&extra=value`)

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
    const url = new URL(`${URL_BASE}?search=&filter=test`)

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
    const url = new URL(`${URL_BASE}?page=abc&limit=10`)

    // Act & Assert
    expect(() => parseQueryParams(url, schema)).toThrow()
  })
})

describe('route schema integration', () => {
  describe('feedQuerySchema', () => {
    it('should handle round trip with positive integers', () => {
      // Arrange
      const valid = { pageSize: 5 } satisfies FeedQuery

      // Act
      const params = buildQueryParams({ pageSize: valid.pageSize.toString() })
      const url = new URL(`${URL_BASE}${params}`)
      const result = parseQueryParams(url, feedQuerySchema)

      // Assert
      expect(result).toEqual(valid)
    })
    it('should handle round trip with negative integers', () => {
      // Arrange
      const valid = { pageSize: -5 } satisfies FeedQuery

      // Act & Assert
      const params = buildQueryParams({ pageSize: valid.pageSize.toString() })
      const url = new URL(`${URL_BASE}${params}`)
      expect(() => parseQueryParams(url, feedQuerySchema)).toThrow()
    })
    it('should handle round trip with not a number', () => {
      // Arrange
      const valid = { pageSize: 'not-a-number' }

      // Act & Assert
      const params = buildQueryParams(valid)
      const url = new URL(`${URL_BASE}${params}`)
      expect(() => parseQueryParams(url, feedQuerySchema)).toThrow()
    })
  })

  it('should handle round trip with supplierSearchQuerySchema', () => {
    const valid = {
      q: 'Test name',
    } satisfies SupplierSearchGetRequest

    const params = buildQueryParams(valid)
    const url = new URL(`${URL_BASE}${params}`)
    const result = parseQueryParams(url, supplierSearchGetRequestSchema)

    expect(result).toEqual(valid)
  })

  it('should handle round trip with tileCreditFormSchema', () => {
    // Arrange
    const valid = {
      supplierId: 'supplier-1',
      service: SERVICES.CATERER,
      serviceDescription: 'Great service',
    } satisfies TileCreditForm

    // Act
    const params = buildQueryParams(valid)
    const url = new URL(`${URL_BASE}${params}`)
    const result = parseQueryParams(url, tileCreditFormSchema)

    // Assert
    expect(result).toEqual(valid)
  })
})
