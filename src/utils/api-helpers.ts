import { ZodObject, z } from 'zod'

// Error response type for API responses
export type ErrorResponse = {
  message: string
}

/**
 * Builds a query string from a record of parameters.
 * @param params - The record of parameters to build the query string from.
 * @returns The query string.
 */
export const buildQueryParams = <T extends Record<string, string | undefined>>(params: T) => {
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
export const parseQueryParams = <T extends ZodObject<any>>(url: URL, schema: T): z.infer<T> => {
  const raw: Record<string, string | undefined> = {}

  for (const key of Object.keys(schema.shape)) {
    const value = url.searchParams.get(key)
    raw[key] = value ?? undefined
  }

  return schema.parse(raw)
}
