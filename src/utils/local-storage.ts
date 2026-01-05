import { isClient } from '@/utils/api-helpers'

import { LOCAL_STORAGE_KEYS, SignInMethod, SIGN_IN_METHODS } from './constants'
import { OPERATION_ERROR } from '@/app/_types/errors'

/**
 * Saves the last sign-in method to localStorage.
 * @param method - The sign-in method ('email' or 'google')
 * @throws Error if localStorage is not available (e.g., in private browsing mode)
 */
export async function saveLastSignInMethod(method: SignInMethod): Promise<void> {
  if (!isClient()) throw OPERATION_ERROR.INVALID_STATE('Cannot save last sign-in method on the server')

  localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_SIGN_IN_METHOD, method)
}

/**
 * Gets the last sign-in method from localStorage.
 * @returns The last sign-in method or null if not found
 * @throws Error if localStorage is not available
 */
export async function getLastSignInMethod(): Promise<SignInMethod | null> {
  if (!isClient()) throw OPERATION_ERROR.INVALID_STATE('Cannot get last sign-in method on the server')

  const method = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SIGN_IN_METHOD)
  if (!method) return null

  if (!Object.values(SIGN_IN_METHODS).includes(method as any)) throw OPERATION_ERROR.INVALID_STATE('Invalid sign-in method')

  // safe cast to SignInMethod because we checked it is in the allowed values
  return method as SignInMethod
}
