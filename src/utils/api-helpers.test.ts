import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { FeedGetRequest, feedGetRequestSchema } from '@/app/api/feed/types'
import { supplierTilesGetRequestSchema, SupplierTilesGetRequest } from '@/app/api/suppliers/[id]/tiles/types'
import { supplierSearchGetRequestSchema, SupplierSearchGetRequest } from '@/app/api/suppliers/search/types'
import { userTilesGetRequestSchema, UserTilesGetRequest } from '@/app/api/users/[id]/tiles/types'
import { TEST_ID } from '@/testing/scene'

import { buildQueryParams, buildUrlWithSearchParams, getBaseUrl, getOrigin, parseQueryParams, sanitizeNext } from './api-helpers'
import { ALLOWED_NEXT_PATHS, AllowedNextPath, BASE_URL } from './constants'

const TEST_BASE_URL = 'https://example.com/api' as const

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
    const url = new URL(`${TEST_BASE_URL}${buildQueryParams(params)}`)

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
    const url = new URL(`${TEST_BASE_URL}${buildQueryParams(params)}`)

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
    const url = new URL(`${TEST_BASE_URL}${buildQueryParams(params)}`)

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
    const url = new URL(`${TEST_BASE_URL}${buildQueryParams(params)}`)

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
    const url = new URL(`${TEST_BASE_URL}${buildQueryParams(params)}`)

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
    const url = new URL(`${TEST_BASE_URL}${buildQueryParams(params)}`)

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
    const url = new URL(`${TEST_BASE_URL}${buildQueryParams(params)}`)

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
    const url = new URL(`${TEST_BASE_URL}${buildQueryParams(params)}`)

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
    const url = new URL(`${TEST_BASE_URL}${buildQueryParams(params)}`)

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
    const url = new URL(`${TEST_BASE_URL}${buildQueryParams(params)}`)

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
    const url = new URL(`${TEST_BASE_URL}${buildQueryParams(params)}`)

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
      const url = new URL(`${TEST_BASE_URL}${params}`)
      const result = parseQueryParams(url, feedGetRequestSchema)

      // Assert
      expect(result).toEqual(valid)
    })
    it('should handle round trip with negative integers', () => {
      // Arrange
      const valid = { pageSize: -5 } satisfies FeedGetRequest

      // Act & Assert
      const params = buildQueryParams({ pageSize: valid.pageSize.toString() })
      const url = new URL(`${TEST_BASE_URL}${params}`)
      expect(() => parseQueryParams(url, feedGetRequestSchema)).toThrow()
    })
    it('should handle round trip with not a number', () => {
      // Arrange
      const valid = { pageSize: 'not-a-number' }

      // Act & Assert
      const params = buildQueryParams(valid)
      const url = new URL(`${TEST_BASE_URL}${params}`)
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
      const url = new URL(`${TEST_BASE_URL}${params}`)
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
      const url = new URL(`${TEST_BASE_URL}${params}`)
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
      const url = new URL(`${TEST_BASE_URL}${params}`)
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
      const url = new URL(`${TEST_BASE_URL}${params}`)
      const result = parseQueryParams(url, userTilesGetRequestSchema)

      // Assert
      expect(result).toEqual(valid)
    })
  })
})

describe('buildUrlWithSearchParams', () => {
  describe('basic functionality', () => {
    it('should build a URL with search params from absolute URL', () => {
      // Arrange
      const searchParams = {
        page: '1',
        limit: '10',
        search: 'test',
      }

      // Act
      const result = buildUrlWithSearchParams(TEST_BASE_URL, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.origin + url.pathname).toBe(TEST_BASE_URL)
      expect(url.searchParams.get('page')).toBe('1')
      expect(url.searchParams.get('limit')).toBe('10')
      expect(url.searchParams.get('search')).toBe('test')
    })

    it('should build a URL with search params from relative path', () => {
      // Arrange
      const relativeUrl = '/sign-in'
      const searchParams = {
        page: '1',
        limit: '10',
        search: 'test',
      }

      // Act
      const result = buildUrlWithSearchParams(relativeUrl, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.origin).toBe(BASE_URL)
      expect(url.pathname).toBe('/sign-in')
      expect(url.searchParams.get('page')).toBe('1')
      expect(url.searchParams.get('limit')).toBe('10')
      expect(url.searchParams.get('search')).toBe('test')
    })

    it('should exclude undefined values from the URL', () => {
      // Arrange
      const searchParams = {
        page: '1',
        limit: undefined,
        search: 'test',
      }

      // Act
      const result = buildUrlWithSearchParams(TEST_BASE_URL, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.searchParams.get('page')).toBe('1')
      expect(url.searchParams.get('search')).toBe('test')
      expect(url.searchParams.has('limit')).toBe(false)
    })

    it('should handle empty params object', () => {
      // Arrange
      const searchParams = {}

      // Act
      const result = buildUrlWithSearchParams(TEST_BASE_URL, searchParams)

      // Assert
      expect(result).toBe(TEST_BASE_URL)
    })

    it('should handle single parameter', () => {
      // Arrange
      const searchParams = {
        page: '1',
      }

      // Act
      const result = buildUrlWithSearchParams(TEST_BASE_URL, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.searchParams.get('page')).toBe('1')
      expect(url.searchParams.getAll('page')).toEqual(['1'])
      expect(Array.from(new Set(url.searchParams.keys()))).toEqual(['page']) // Ensure no unexpected params
    })

    it('should handle all undefined values', () => {
      // Arrange
      const searchParams = {
        page: undefined,
        limit: undefined,
      }

      // Act
      const result = buildUrlWithSearchParams(TEST_BASE_URL, searchParams)

      // Assert
      expect(result).toBe(TEST_BASE_URL)
    })

    it('should encode special characters in values', () => {
      // Arrange
      const searchParams = {
        search: 'hello world',
        filter: 'test&value',
      }

      // Act
      const result = buildUrlWithSearchParams(TEST_BASE_URL, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.searchParams.get('search')).toBe('hello world')
      expect(url.searchParams.get('filter')).toBe('test&value')
      // Guard against a bug where `&` is not encoded and splits query params.
      expect(result).toContain('search=hello+world')
      expect(result).toContain('filter=test%26value')
    })

    it('should handle empty string values', () => {
      // Arrange
      const searchParams = {
        page: '',
        limit: '10',
      }

      // Act
      const result = buildUrlWithSearchParams(TEST_BASE_URL, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.searchParams.get('page')).toBe('')
      expect(url.searchParams.get('limit')).toBe('10')
    })
  })

  describe('replacing existing query parameters', () => {
    it('should replace existing query parameters', () => {
      // Arrange
      const relativeUrl = `${TEST_BASE_URL}?page=1&limit=10`
      const searchParams = {
        page: '2',
      }

      // Act
      const result = buildUrlWithSearchParams(relativeUrl, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.searchParams.get('page')).toBe('2')
      expect(url.searchParams.get('limit')).toBe('10')
      expect(url.searchParams.getAll('page')).toEqual(['2'])
      expect(url.searchParams.getAll('limit')).toEqual(['10'])
    })

    it('should preserve unrelated existing query parameters when replacing', () => {
      // Arrange
      const relativeUrl = `${TEST_BASE_URL}?page=1&keep=1`
      const searchParams = {
        page: '2',
      }

      // Act
      const result = buildUrlWithSearchParams(relativeUrl, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.searchParams.get('page')).toBe('2')
      expect(url.searchParams.get('keep')).toBe('1')
      expect(url.searchParams.getAll('page')).toEqual(['2'])
      expect(url.searchParams.getAll('keep')).toEqual(['1'])
    })

    it('should replace existing query parameters and add new ones', () => {
      // Arrange
      const relativeUrl = `${TEST_BASE_URL}?page=1`
      const searchParams = {
        page: '2',
        limit: '10',
      }

      // Act
      const result = buildUrlWithSearchParams(relativeUrl, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.searchParams.get('page')).toBe('2')
      expect(url.searchParams.get('limit')).toBe('10')
      expect(url.searchParams.getAll('page')).toEqual(['2'])
      expect(url.searchParams.getAll('limit')).toEqual(['10'])
    })

    it('should remove existing query parameters when set to undefined', () => {
      // Arrange
      const relativeUrl = `${TEST_BASE_URL}?page=1&limit=10`
      const searchParams = {
        page: undefined,
        limit: '20',
      }

      // Act
      const result = buildUrlWithSearchParams(relativeUrl, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.searchParams.has('page')).toBe(false)
      expect(url.searchParams.get('limit')).toBe('20')
      expect(url.searchParams.getAll('limit')).toEqual(['20'])
    })
  })

  describe('array values', () => {
    it('should handle array values for repeated parameters', () => {
      // Arrange
      const searchParams = {
        tags: ['wedding', 'photography', 'venue'],
      }

      // Act
      const result = buildUrlWithSearchParams(TEST_BASE_URL, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.searchParams.getAll('tags')).toEqual(['wedding', 'photography', 'venue'])
    })

    it('should handle array values with other parameters', () => {
      // Arrange
      const searchParams = {
        page: '1',
        tags: ['wedding', 'photography'],
        limit: '10',
      }

      // Act
      const result = buildUrlWithSearchParams(TEST_BASE_URL, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.searchParams.get('page')).toBe('1')
      expect(url.searchParams.getAll('tags')).toEqual(['wedding', 'photography'])
      expect(url.searchParams.get('limit')).toBe('10')
    })

    it('should replace existing single values with array values', () => {
      // Arrange
      const relativeUrl = `${TEST_BASE_URL}?tags=old`
      const searchParams = {
        tags: ['new1', 'new2'],
      }

      // Act
      const result = buildUrlWithSearchParams(relativeUrl, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.searchParams.getAll('tags')).toEqual(['new1', 'new2'])
    })

    it('should handle empty array', () => {
      // Arrange
      const searchParams = {
        tags: [],
        page: '1',
      }

      // Act
      const result = buildUrlWithSearchParams(TEST_BASE_URL, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.searchParams.has('tags')).toBe(false)
      expect(url.searchParams.get('page')).toBe('1')
    })
  })

  describe('relative paths', () => {
    it('should handle relative path without existing query params', () => {
      // Arrange
      const relativeUrl = '/sign-in'
      const searchParams = {
        next: '/account',
      }

      // Act
      const result = buildUrlWithSearchParams(relativeUrl, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.pathname).toBe('/sign-in')
      expect(url.searchParams.get('next')).toBe('/account')
    })

    it('should handle relative path with existing query params', () => {
      // Arrange
      const relativeUrl = '/sign-in?error=1'
      const searchParams = {
        next: '/account',
      }

      // Act
      const result = buildUrlWithSearchParams(relativeUrl, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.pathname).toBe('/sign-in')
      expect(url.searchParams.get('error')).toBe('1')
      expect(url.searchParams.get('next')).toBe('/account')
    })

    it('should handle relative path replacing existing params', () => {
      // Arrange
      const relativeUrl = '/sign-in?next=/old'
      const searchParams = {
        next: '/new',
      }

      // Act
      const result = buildUrlWithSearchParams(relativeUrl, searchParams)

      // Assert
      const url = new URL(result)
      expect(url.pathname).toBe('/sign-in')
      expect(url.searchParams.get('next')).toBe('/new')
      expect(url.searchParams.getAll('next')).toEqual(['/new'])
    })
  })
})

describe('parseSearchParams', () => {})

const isAllowedNextPath = (path: string) => ALLOWED_NEXT_PATHS.includes(path as AllowedNextPath)

describe('sanitizeNext', () => {
  describe('basic functionality', () => {
    it('should return the default next path if no next path is provided', () => {
      // Arrange
      const next = undefined

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should return the default next path if next is null', () => {
      // Arrange
      const next = null

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should return the default next path if next is empty string', () => {
      // Arrange
      const next = ''

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should return the next path if the next path is in the allowed paths', () => {
      // Arrange
      const next = '/feed'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should return the next path for all allowed paths', () => {
      // Arrange, Act & Assert
      ALLOWED_NEXT_PATHS.forEach((path) => {
        expect(sanitizeNext(path)).toBe(path)
      })
    })

    it('should return the default next path if the next path is not in the allowed paths', () => {
      // Arrange
      const next = '/not-allowed'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })
  })

  describe('open redirect attacks', () => {
    it('should reject external HTTPS URLs', () => {
      // Arrange
      const next = 'https://evil.com'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject external HTTP URLs', () => {
      // Arrange
      const next = 'http://evil.com'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject javascript: protocol', () => {
      // Arrange
      const next = 'javascript:alert(1)'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject data: protocol', () => {
      // Arrange
      const next = 'data:text/html,<script>alert(1)</script>'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject protocol-relative URLs', () => {
      // Arrange
      const next = '//evil.com'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject mixed case protocol schemes', () => {
      // Arrange
      const testCases = ['JavaScript:alert(1)', 'HTTPS://evil.com', 'Http://evil.com']

      // Act & Assert
      testCases.forEach((next) => {
        expect(isAllowedNextPath(sanitizeNext(next))).toBe(true)
      })
    })
  })

  describe('path traversal attacks', () => {
    it('should reject path traversal from feed to account', () => {
      // Arrange
      const next = '/feed/../account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject deep path traversal', () => {
      // Arrange
      const next = '/feed/../../../../../etc/passwd'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject mixed path traversal', () => {
      // Arrange
      const next = '/feed/./../account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject URL-encoded path traversal', () => {
      // Arrange
      const next = '/feed/%2e%2e/account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject double-encoded path traversal', () => {
      // Arrange
      const next = '/feed/%252e%252e/account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject encoded slash in path traversal', () => {
      // Arrange
      const next = '/feed/%2faccount'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject double slashes with traversal', () => {
      // Arrange
      const next = '/feed//../account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject traversal from suppliers to account', () => {
      // Arrange
      const next = '/suppliers/../account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject traversal from onboarding to account', () => {
      // Arrange
      const next = '/onboarding/../account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })
  })

  describe('case sensitivity attacks', () => {
    it('should return the lowercase feed path', () => {
      // Arrange
      const next = '/Feed'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
      expect(result).toBe('/feed' satisfies AllowedNextPath)
    })

    it('should return the lowercase account path', () => {
      // Arrange
      const next = '/Account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
      expect(result).toBe('/account' satisfies AllowedNextPath)
    })

    it('should return the lowercase suppliers/register path', () => {
      // Arrange
      const next = '/Suppliers/register'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
      expect(result).toBe('/suppliers/register' satisfies AllowedNextPath)
    })

    it('should return the lowercase paths', () => {
      // Arrange
      const testCases = ['/FEED', '/FeEd', '/AcCoUnT', '/SUPPLIERS/regisTEr']

      testCases.forEach((next) => {
        // Act
        const result = sanitizeNext(next)

        // Assert
        expect(isAllowedNextPath(result)).toBe(true)
        expect(result).toBe(next.toLowerCase())
      })
    })
  })

  describe('whitespace and control character attacks', () => {
    it('should reject leading whitespace', () => {
      // Arrange
      const next = ' /feed'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject trailing whitespace', () => {
      // Arrange
      const next = '/feed '

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject leading and trailing whitespace', () => {
      // Arrange
      const next = ' /feed '

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject newline characters', () => {
      // Arrange
      const next = '/feed\n/account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject tab characters', () => {
      // Arrange
      const next = '/feed\t/account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject null byte characters', () => {
      // Arrange
      const next = '/feed\0/account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject carriage return characters', () => {
      // Arrange
      const next = '/feed\r/account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })
  })

  describe('query parameter and fragment injection', () => {
    it('should handle query parameters in allowed paths', () => {
      // Arrange
      const next = '/feed?test=1'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should handle query parameters with redirect attempts', () => {
      // Arrange
      const next = '/feed?redirect=https://evil.com'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should handle fragments in allowed paths', () => {
      // Arrange
      const next = '/feed#section'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should handle query parameters with nested next param', () => {
      // Arrange
      const next = '/feed?next=https://evil.com'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })
  })

  describe('path normalization edge cases', () => {
    it('should handle trailing slashes', () => {
      // Arrange
      const next = '/feed/'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should handle double slashes', () => {
      // Arrange
      const next = '/feed//account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should handle current directory references', () => {
      // Arrange
      const next = '/feed/./account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should handle sub-paths of allowed paths', () => {
      // Arrange
      const next = '/feed/some/sub/path'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should handle suppliers sub-paths', () => {
      // Arrange
      const next = '/suppliers/register'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })
  })

  describe('URL encoding bypass attempts', () => {
    it('should reject encoded feed path', () => {
      // Arrange
      const next = '%2Ffeed'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject encoded account path', () => {
      // Arrange
      const next = '%2Faccount'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject mixed encoding', () => {
      // Arrange
      const next = '%2f%66%65%65%64'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })
  })

  describe('path prefix confusion attacks', () => {
    it('should reject paths that look like allowed paths but are not', () => {
      // Arrange
      const next = '/feed-extra'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject paths that start with allowed path but are malicious', () => {
      // Arrange
      const next = '/feed/../../account'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })

    it('should reject paths that bypass with similar names', () => {
      // Arrange
      const next = '/feedx'

      // Act
      const result = sanitizeNext(next)

      // Assert
      expect(isAllowedNextPath(result)).toBe(true)
    })
  })
})
