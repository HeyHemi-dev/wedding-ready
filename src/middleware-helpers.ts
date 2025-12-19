import { PROTECTED_PATHS } from '@/utils/constants'

/**
 * Checks if a given pathname requires authentication. Used by middleware and auth-related functions to enforce authentication.
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path))
}
