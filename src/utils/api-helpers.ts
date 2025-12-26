import { ZodObject, z } from 'zod'

import { OPERATION_ERROR } from '@/app/_types/errors'

import { BASE_URL } from './constants'
import { SearchParams } from '@/app/_types/generics'

// Error response type for API responses
export type ErrorResponse = {
  message: string
}

type ParamKey = string
type ParamValue = string | undefined

/**
 * Builds a query string from a record of parameters.
 * @param params - The record of parameters to build the query string from.
 * @returns The query string.
 */
export function buildQueryParams<T extends Record<ParamKey, ParamValue>>(params: T): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.append(key, value)
  })

  return `?${searchParams.toString()}`
}

/**
 * Parses the query parameters from a URL object using a Zod schema.
 * @param url - The URL object to parse.
 * @param schema - The Zod schema to validate the query parameters against.
 * @returns The parsed query parameters.
 */
export function parseQueryParams<T extends ZodObject<Record<string, z.ZodType>>>(url: URL, schema: T): z.infer<T> {
  const raw: Record<ParamKey, ParamValue> = {}

  for (const key of Object.keys(schema.shape)) {
    const value = url.searchParams.get(key)
    raw[key] = value ?? undefined
  }

  return schema.parse(raw)
}

/**
 * Gets specific query parameter from Next.js search params.
 * @param params - The Next.js search params object.
 * @param key - The key of the query parameter to get.
 * @returns The value of the query parameter, or undefined.
 */
export function getQueryParam(params: SearchParams, key: string) {
  const v = params[key]
  return typeof v === 'string' ? v : undefined
}

/**
 * Parses Next.js search params using a Zod object schema.
 *
 * - Treats query params as untrusted input.
 * - Only extracts keys defined in the Zod schema (allow-list).
 * - Ignores all other query params.
 * - Preserves Next.js semantics where a param may be a string or string[].
 * - Delegates validation, coercion, defaults, and optionality to Zod.
 *
 * Designed to work with:
 * - `searchParams` from `page.tsx` (Server Components)
 * - Normalised search params from route handlers (`urlSearchParamsToObject(req.nextUrl.searchParams)`)
 *
 * @param searchParams - The Next.js search params object.
 * @param schema - A Zod object schema defining the allowed query parameters.
 * @returns The parsed and validated object inferred from the schema.
 *
 * @example
 * const SignInParams = z.object({
 *   next: z.string().optional(),
 *   msg: z.enum(['invalid_credentials', 'session_expired']).optional(),
 * })
 *
 * const { next, msg } = parseSearchParams(searchParams, SignInParams)
 */
export function parseSearchParams<T extends z.ZodRawShape>(searchParams: SearchParams, schema: z.ZodObject<T>): z.infer<typeof schema> {
  const raw: Record<string, string | string[] | undefined> = {}

  for (const key of Object.keys(schema.shape)) {
    const v = searchParams[key]
    raw[key] = typeof v === 'string' || Array.isArray(v) ? v : undefined
  }

  return schema.parse(raw)
}

export function urlSearchParamsToObject(searchParams: URLSearchParams): SearchParams {
  const object: SearchParams = {}
  for (const key of searchParams.keys()) {
    const all = searchParams.getAll(key)
    object[key] = all.length === 1 ? all[0] : all.length > 1 ? all : undefined
  }
  return object
}

export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Gets the base URL for API requests.
 * On the server, constructs an absolute URL. On the client, returns empty string for relative URLs.
 */
export function getBaseUrl(): string {
  // On the client, use relative URLs
  if (isClient()) return ''

  // On the server, use absolute URL
  return BASE_URL
}

/**
 * Converts a relative URL to an absolute URL if needed (on the server).
 */
export function normalizeUrl(url: string): string {
  // If URL is already absolute, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  // On the client, return relative URL as-is
  if (isClient()) return url

  // On the server, convert relative URLs to absolute
  const baseUrl = getBaseUrl()
  return `${baseUrl}${url}`
}

/**
 * Gets the origin of the current page.
 * On the client, returns the window.location.origin.
 * On the server, throws an error.
 */

export function getOrigin(): string {
  if (isClient()) {
    return window.location.origin
  } else {
    throw OPERATION_ERROR.INVALID_STATE('Cannot call getOrigin on the server')
  }
}
