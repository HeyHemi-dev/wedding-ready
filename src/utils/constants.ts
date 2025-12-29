export const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

export const DEFAULT_STALE_TIME = 60 * 1000 // 1 minute
export const AUTH_STALE_TIME = 5 * 60 * 1000 // 5 minutes

export const MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * 1 // 1MB

export const FEED_PAGE_SIZE = 10

export const FETCH_TIMEOUT = 10 * 1000 // 10 seconds

export const RESEND_EMAIL_COOLDOWN_ENDS_AT_STORAGE_KEY = 'resend-email-cooldown-ends-at-ms'
export const RESEND_EMAIL_COOLDOWN_SECONDS = 60

export const PARAMS = {
  // next URL to redirect to
  NEXT: 'next',

  // message type using AuthMessage
  MESSAGE_TYPE: 'mtype',

  // message code using AuthMessage
  AUTH_MESSAGE_CODE: 'auth_code',
} as const

export const HEADERS = {
  // pass authenticated user ID from middleware to server components
  AUTH_USER_ID: 'x-auth-user-id',

  // pass authenticated user verified status from middleware to server components
  AUTH_IS_VERIFIED: 'x-auth-is-verified',

  // pass authenticated user onboarded status from middleware to server components
  AUTH_IS_ONBOARDED: 'x-auth-is-onboarded',
} as const

export const LOCAL_STORAGE_KEYS = {
  RESEND_EMAIL_COOLDOWN_ENDS_AT: RESEND_EMAIL_COOLDOWN_ENDS_AT_STORAGE_KEY,
  LAST_SIGN_IN_WITH: 'last-sign-in-with',
} as const

/**
 * Paths that require authentication. Used by middleware and auth-related functions.
 */
export const PROTECTED_PATHS = ['/account', '/suppliers/register', '/suppliers/:handle/new']

/**
 * Paths that are allowed to be redirected to using the NEXT parameter
 */
export const ALLOWED_NEXT_PATHS = ['/feed', '/account', '/suppliers/register', '/onboarding'] as const
export type AllowedNextPath = (typeof ALLOWED_NEXT_PATHS)[number]
