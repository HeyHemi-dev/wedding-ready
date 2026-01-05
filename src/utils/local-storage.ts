import { isClient } from '@/utils/api-helpers'
import { logger } from '@/utils/logger'
import { tryCatchSync } from '@/utils/try-catch'

import { LOCAL_STORAGE_KEYS, SignInMethod, SIGN_IN_METHODS } from './constants'

/**
 * Saves the last sign-in method to localStorage.
 * Fails silently if localStorage is not available (e.g., in private browsing mode or on server).
 * @param method - The sign-in method ('email' or 'google')
 */
export function saveLastSignInMethod(method: SignInMethod): void {
  if (!isClient()) return

  const { error } = tryCatchSync(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_SIGN_IN_METHOD, method)
  })

  if (error) {
    logger.error('local-storage.save_last_sign_in_method_failed', { error })
  }
  // Silently fail - error is ignored
}

/**
 * Gets the last sign-in method from localStorage.
 * Returns null if not found, invalid, or if localStorage is not available.
 * @returns The last sign-in method or null
 */
export function getLastSignInMethod(): SignInMethod | null {
  if (!isClient()) return null

  const { data: method, error } = tryCatchSync(() => localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SIGN_IN_METHOD))

  if (error || !method) return null

  if (!Object.values(SIGN_IN_METHODS).includes(method as SignInMethod)) {
    // Invalid data in localStorage - clean it up
    tryCatchSync(() => localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_SIGN_IN_METHOD))
    return null
  }

  return method as SignInMethod
}
