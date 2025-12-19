import { redirect } from 'next/navigation'

import { PARAMS } from '@/utils/constants'

export const ENCODED_REDIRECT_TYPES = [PARAMS.ERROR, PARAMS.SUCCESS, PARAMS.MESSAGE] as const
type EncodedRedirectType = (typeof ENCODED_REDIRECT_TYPES)[number]

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(type: EncodedRedirectType, path: string, message: string) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`)
}
