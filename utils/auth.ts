/**
 * List of paths that require authentication.
 * Used by middleware and auth-related functions to enforce authentication.
 */
export const PROTECTED_PATHS = ['/account', '/supplier/register'] as const

/**
 * Checks if a given pathname requires authentication
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path))
}
