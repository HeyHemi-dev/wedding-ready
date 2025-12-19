import { HEADERS } from './constants'

/**
 * Paths that require authentication. Used by middleware and auth-related functions.
 */
export const PROTECTED_PATHS = ['/account', '/suppliers/register', '/suppliers/:handle/new']

/**
 * Checks if a given pathname requires authentication. Used by middleware and auth-related functions to enforce authentication.
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path))
}

/**
 * Header name used to pass authenticated user ID from middleware to server components/actions.
 */
export const AUTH_HEADER_NAME = HEADERS.AUTH_USER_ID
