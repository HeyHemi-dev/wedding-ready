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

  // message to display using encodedRedirect and FormMessage
  MESSAGE: 'm',

  // message type using encodedRedirect and FormMessage
  MESSAGE_TYPE: 'mtype',
} as const

export const HEADERS = {
  // pass authenticated user ID from middleware to server components
  AUTH_USER_ID: 'x-auth-user-id',
} as const

export const LOCAL_STORAGE_KEYS = {
  RESEND_EMAIL_COOLDOWN_ENDS_AT: RESEND_EMAIL_COOLDOWN_ENDS_AT_STORAGE_KEY,
  LAST_SIGN_IN_WITH: 'last-sign-in-with',
} as const

/**
 * Paths that require authentication. Used by middleware and auth-related functions.
 */
export const PROTECTED_PATHS = ['/account', '/suppliers/register', '/suppliers/:handle/new']
