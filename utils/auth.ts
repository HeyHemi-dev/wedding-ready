import { headers } from 'next/headers'

/**
 * List of paths that require authentication.
 * Used by middleware and auth-related functions to enforce authentication.
 */
export const PROTECTED_PATHS = ['/account', '/suppliers/register', '/suppliers/:handle/new', '/api'] as const

/**
 * Checks if a given pathname requires authentication
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path))
}

/**
 * We set the authenticated user's id in the request headers using middleware.
 * This function retrieves the id from the headers.
 *
 * @returns The authenticated user's id or null if not authenticated
 */
export async function getAuthenticatedUserId() {
  const headersList = await headers()
  const userId = headersList.get('x-auth-user-id')

  return userId
}
