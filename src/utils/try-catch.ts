import { OPERATION_ERROR } from '@/app/_types/errors'
import { isClient } from '@/utils/api-helpers'
import { FETCH_TIMEOUT } from '@/utils/constants'
import { logger } from './logger'

// Types for the result object with discriminated union
type Success<T> = {
  data: T
  error: null
}

type Failure<E> = {
  data: null
  error: E
}

type Result<T, E = Error> = Success<T> | Failure<E>

// Export Result type for use in other files
export type { Result }

// Main wrapper function

/**
 * Wraps a promise and returns a typed result
 * Encourages explicit error handling by returning a result object instead of throwing.
 * @returns data (promise result) with type T and error as null, OR
 * @returns data as null and error with type E
 *
 */
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as E }
  }
}

/**
 * Wraps a synchronous function and returns a typed result.
 * Encourages explicit error handling by returning a result object instead of throwing.
 * @returns data (function result) with type T and error as null, OR
 * @returns data as null and error with type E
 *
 */
export function tryCatchSync<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    const data = fn()
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as E }
  }
}

export type FetchOptions = RequestInit & {
  customErrorMessage?: string
}

/**
 * Wraps fetch with custom error handling.
 * Handles network errors, auth errors, server errors, and json parsing errors.
 *
 * @example
 * const response = await tryCatchFetch<ResponseType>('/api/users', {
 *   method: 'GET',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 * })

 *
 * @returns data (parsed fetch response) with type T and error as null, OR
 * @returns data null and error with type E
 */
export async function tryCatchFetch<T, E = Error>(url: string, options?: FetchOptions): Promise<Result<T, E>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, FETCH_TIMEOUT)

  try {
    if (isClient() === false) throw OPERATION_ERROR.INVALID_STATE('Cannot call tryCatchFetch on the server')

    const { data: response, error: fetchError } = await tryCatch(fetch(url, { ...options, signal: controller.signal }))
    clearTimeout(timeout)

    if (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out')
      }

      throw new Error('Network error: Failed to connect to server')
    }

    if (!response.ok) {
      // Handle auth errors first - we can check this without parsing
      if (response.status === 401 || response.status === 403) {
        throw new Error('Please sign in to continue')
      }

      // Try to parse error response for other error types
      const { data: errorData, error: parseError } = await tryCatch(response.json())

      if (parseError) {
        throw new Error(`Server error: ${response.statusText}`)
      }

      throw new Error(errorData?.message || options?.customErrorMessage || `Request failed: ${response.statusText}`)
    }

    // Try to parse successful response
    const { data: result, error: parseError } = await tryCatch(response.json())

    if (parseError) {
      throw new Error('Failed to parse server response')
    }

    return { data: result as T, error: null }
  } catch (error) {
    clearTimeout(timeout)
    logger.error('tryCatchFetch_error', {
      url,
      options,
      error: error,
    })
    return { data: null, error: error as E }
  }
}
