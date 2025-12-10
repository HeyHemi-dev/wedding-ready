import { ZodObject, z } from 'zod'

import { BASE_URL } from './constants'

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
