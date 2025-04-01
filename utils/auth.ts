import { headers } from 'next/headers'

export const PROTECTED_PATHS = ['/account', '/suppliers/register', '/suppliers/:handle/new', '/api']

/**
 * Checks if a given pathname requires authentication. Used by middleware and auth-related functions to enforce authentication.
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path))
}

export const AuthHeaderName = 'x-auth-user-id'

/**
 * We set the authenticated user's id in the request headers using middleware.
 * This function retrieves the id from the headers.
 *
 * @returns The authenticated user's id or null if not authenticated
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const headersList = await headers()

  // userId will a valid string if authHeaderName is set. This is handled in middleware
  const userId = headersList.get(AuthHeaderName)

  return userId
}
