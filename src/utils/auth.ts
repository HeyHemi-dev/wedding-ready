import { AuthResponse, User } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { authOperations, SIGN_UP_STATUS } from '@/operations/auth-operations'

import { PARAMS, HEADERS } from './constants'
import { createClient } from './supabase/server'
import { tryCatch } from './try-catch'

export const PROTECTED_PATHS = ['/feed', '/account', '/suppliers/register', '/suppliers/:handle/new']

/**
 * Checks if a given pathname requires authentication. Used by middleware and auth-related functions to enforce authentication.
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path))
}

export const AUTH_HEADER_NAME = HEADERS.AUTH_USER_ID

/**
 * Gets the authenticated user's ID from request headers.
 * Set via middleware.
 *
 * @returns The authenticated user's id or null if not authenticated
 */
export async function getAuthUserId(): Promise<string | null> {
  const headersList = await headers()

  // userId will a valid string if authHeaderName is set. This is handled in middleware
  const userId = headersList.get(AUTH_HEADER_NAME)

  return userId
}

type RequireVerifiedAuthOptions = {
  redirectAfterOnboarding?: string
}

/**
 * Requires authenticated user with verified email.
 * Redirects to sign-in if not authenticated, check-inbox if email not verified, or onboarding if email is verified but profile is not created.
 * @returns The authenticated user's ID.
 */
export async function requireVerifiedAuth(options?: RequireVerifiedAuthOptions): Promise<{
  authUserId: string
}> {
  const authUserId = await getAuthUserId()
  if (!authUserId) {
    redirect('/sign-in')
  }

  const supabase = await createClient()
  const { data, error } = await tryCatch(authOperations.getUserSignUpStatus(supabase))

  if (error || !data) {
    redirect('/sign-in')
  }
  if (data.status === SIGN_UP_STATUS.UNVERIFIED) {
    redirect('/check-inbox')
  }
  if (data.status !== SIGN_UP_STATUS.ONBOARDED) {
    redirect(`/onboarding${options?.redirectAfterOnboarding && `?${PARAMS.NEXT}=${options.redirectAfterOnboarding}`}`)
  }

  return { authUserId }
}

export function handleSupabaseSignUpAuthResponse({ data, error }: AuthResponse): User {
  // Supabase Auth Response Types according to docs.
  // https://supabase.com/docs/reference/javascript/auth-signup

  // New User, Email Confirmation Enabled:
  // data.user: User,
  // data.session: null,
  // error: null:

  // New User, Email Confirmation Disabled:
  // data.user: User,
  // data.session: Session,
  // error: null

  // Existing Confirmed User, Both Confirm Email & Phone Enabled:
  // data.user: ObfuscatedUser,
  // data.session: null,
  // error: null

  // Existing Confirmed User, Either Confirm Email or Phone Disabled:
  // data.user: null,
  // data.session: null,
  // error: { message: "User already registered" }

  if (error) {
    if (error.message === 'User already registered') {
      // existing confirmed user
      throw new Error('User already exists')
    } else {
      // some other error
      console.error(error.message)
    }
  } else if (!data.session) {
    throw new Error('Check your email')
  }

  // We can assert that data.user exists because we have handled all other possible cases.
  return data.user!
}
