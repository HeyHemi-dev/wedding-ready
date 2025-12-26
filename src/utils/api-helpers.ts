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
 * @deprecated use buildUrlWithSearchParams instead
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
 * @deprecated use parseSearchParams instead
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
 * Updates the query parameters of a URL or path.
 *
 * - Replaces existing values for the same key
 * - Removes keys when value is `undefined`
 * - Supports repeated params via `string[]`
 * - Uses `URLSearchParams` for correct encoding
 *
 * @param baseUrl - The existing URL or path (e.g. "/sign-in?next=/account")
 * @param searchParams - Query params to set or update
 * @returns The updated path including query string
 */
export function buildUrlWithSearchParams(baseUrl: string, searchParams: SearchParams): string {
  const url = new URL(baseUrl, BASE_URL)
  const sp = url.searchParams

  Object.entries(searchParams).forEach(([key, value]) => {
    sp.delete(key)
    if (value === undefined) return

    if (Array.isArray(value)) value.forEach((v) => sp.append(key, v))
    else sp.append(key, value)
  })

  return url.toString()
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
 * @returns a promise that resolves to the parsed and validated object inferred from the schema. Use with tryCatch util function to handle validation errors.
 *
 * @example
 * const Schema = z.object({
 *   next: z.string().optional(),
 * })
 * const { data, error } = await tryCatch(parseSearchParams(searchParams, Schema))
 */
export async function parseSearchParams<T extends z.ZodRawShape>(searchParams: SearchParams, schema: z.ZodObject<T>): Promise<z.infer<typeof schema>> {
  const raw: Record<string, string | string[] | undefined> = {}

  for (const key of Object.keys(schema.shape)) {
    const v = searchParams[key]
    raw[key] = typeof v === 'string' || Array.isArray(v) ? v : undefined
  }

  return schema.parse(raw)
}

/**
 * Converts nextUrl.searchParams to a searchParams object. Use with parseSearchParams to parse the search params.
 *
 * @param urlSearchParams - A nextUrl.searchParams object to convert.
 * @returns The converted searchParams object.
 *
 * @example
 * const searchParams = urlSearchParamsToObject(nextUrl.searchParams)
 * const { data } = await tryCatch(parseSearchParams(searchParams, Schema))
 */
export function urlSearchParamsToObject(urlSearchParams: URLSearchParams): SearchParams {
  const object: SearchParams = {}
  for (const key of urlSearchParams.keys()) {
    const all = urlSearchParams.getAll(key)
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
