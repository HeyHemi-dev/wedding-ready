import { ZodObject, z } from 'zod'

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

function onClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Gets the base URL for API requests.
 * On the server, constructs an absolute URL. On the client, returns empty string for relative URLs.
 */
export function getBaseUrl(): string {
  // On the client, use relative URLs
  if (onClient()) return ''

  // On the server, construct absolute URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  // Default to localhost for development
  return 'http://localhost:3000'
}

/**
 * Converts a relative URL to an absolute URL if needed (on the server).
 */
export function normalizeUrl(url: string): string {
  // If URL is already absolute, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  // On the client, return relative URL as-is
  if (onClient()) return url

  // On the server, convert relative URLs to absolute
  const baseUrl = getBaseUrl()
  return `${baseUrl}${url}`
}

/**
 * Gets request headers and cookies for server-side fetch requests.
 * Only works on the server - returns empty object on the client.
 */
export async function getServerRequestHeaders(): Promise<Record<string, string>> {
  // Only on the server
  if (onClient()) return {}

  try {
    // Dynamically import Next.js headers and cookies to avoid issues in client bundles
    const { headers } = await import('next/headers')
    const { cookies } = await import('next/headers')

    const headersList = await headers()
    const cookieStore = await cookies()

    // Build headers object
    const requestHeaders: Record<string, string> = {}

    // Forward the auth header if it exists (using the same header name as middleware)
    const AUTH_HEADER_NAME = 'x-auth-user-id'
    const authUserId = headersList.get(AUTH_HEADER_NAME)
    if (authUserId) {
      requestHeaders[AUTH_HEADER_NAME] = authUserId
    }

    // Forward cookies
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    if (cookieHeader) {
      requestHeaders['Cookie'] = cookieHeader
    }

    return requestHeaders
  } catch {
    // If we can't get headers/cookies (e.g., in client bundle), return empty
    // This shouldn't happen on the server, but provides a fallback
    return {}
  }
}

export type FetchOptions = RequestInit & {
  customErrorMessage?: string
}

export async function forwardHeaders(options: FetchOptions | undefined): Promise<FetchOptions> {
  let fetchOptions: FetchOptions = { ...options }
  if (!onClient()) {
    const serverHeaders = await getServerRequestHeaders()
    // Merge headers properly - options.headers could be Headers, array, or object
    const existingHeaders = options?.headers
    let mergedHeaders: HeadersInit

    if (existingHeaders instanceof Headers) {
      // If it's a Headers object, copy all entries and add server headers
      const headersObj = new Headers(existingHeaders)
      Object.entries(serverHeaders).forEach(([key, value]) => {
        headersObj.set(key, value)
      })
      mergedHeaders = headersObj
    } else if (Array.isArray(existingHeaders)) {
      // If it's an array of tuples, convert to object and merge
      mergedHeaders = {
        ...Object.fromEntries(existingHeaders),
        ...serverHeaders,
      }
    } else {
      // If it's an object or undefined, merge directly
      mergedHeaders = {
        ...serverHeaders,
        ...(existingHeaders as Record<string, string> | undefined),
      }
    }

    fetchOptions = {
      ...options,
      headers: mergedHeaders,
    }
  }
  return fetchOptions
}
