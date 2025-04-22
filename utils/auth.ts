import { headers } from 'next/headers'
import { createClient } from './supabase/server'

export const PROTECTED_PATHS = ['/feed', '/account', '/suppliers/register', '/suppliers/:handle/new']

/**
 * Checks if a given pathname requires authentication. Used by middleware and auth-related functions to enforce authentication.
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path))
}

export const AUTH_HEADER_NAME = 'x-auth-user-id'

/**
 * We set the authenticated user's id in the request headers using middleware.
 * This function retrieves the id from the headers.
 *
 * @returns The authenticated user's id or null if not authenticated
 */
export async function getAuthUserId(): Promise<string | null> {
  const headersList = await headers()

  // userId will a valid string if authHeaderName is set. This is handled in middleware
  const userId = headersList.get(AUTH_HEADER_NAME)

  return userId
}

export async function getAuthUserIdForAction(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error('Failed to get authenticated user')
  }

  if (!user) {
    return null
  }

  return user.id
}
