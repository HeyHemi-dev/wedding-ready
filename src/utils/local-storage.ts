import { isClient } from '@/utils/api-helpers'

import { LOCAL_STORAGE_KEYS, SignInMethod } from './constants'

/**
 * Saves the last sign-in method to localStorage.
 * @param method - The sign-in method ('email' or 'google')
 */
export function saveLastSignInMethod(method: SignInMethod): void {
  if (!isClient()) return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_SIGN_IN_METHOD, method)
  } catch (error) {
    // Silently fail if localStorage is not available (e.g., in private browsing mode)
    console.error('Failed to save last sign-in method:', error)
  }
}

/**
 * Gets the last sign-in method from localStorage.
 * @returns The last sign-in method or null if not found
 */
export function getLastSignInMethod(): SignInMethod | null {
  if (!isClient()) return null
  try {
    const method = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SIGN_IN_METHOD)
    return method === 'email' || method === 'google' ? method : null
  } catch (error) {
    // Silently fail if localStorage is not available
    console.error('Failed to get last sign-in method:', error)
    return null
  }
}
