import { PROTECTED_PATHS } from '@/utils/constants'

/**
 * Converts a path pattern with dynamic segments (e.g., '/suppliers/:handle/new') into a regex that matches actual paths (e.g., '/suppliers/any-handle/new')
 */
function pathPatternToRegex(pattern: string): RegExp {
  const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+')
  return new RegExp(`^${regexPattern}`)
}

/**
 * Checks if a given pathname requires authentication. Used by middleware and auth-related functions to enforce authentication.
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => {
    // Handle static paths with startsWith for performance
    if (!path.includes(':')) {
      return pathname.startsWith(path)
    }
    // Handle dynamic paths with regex matching
    return pathPatternToRegex(path).test(pathname)
  })
}
