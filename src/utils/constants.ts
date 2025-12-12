export const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

export const DEFAULT_STALE_TIME = 60 * 1000 // 1 minute
export const AUTH_STALE_TIME = 5 * 60 * 1000 // 5 minutes

export const MAX_UPLOAD_FILE_SIZE = 1024 * 1024 * 1 // 1MB

export const FEED_PAGE_SIZE = 10

export const FETCH_TIMEOUT = 10 * 1000 // 10 seconds
