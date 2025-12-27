import { redirect } from 'next/navigation'

import { messageCode, messageType } from '@/components/form/auth-message'
import { PARAMS } from '@/utils/constants'

import { buildUrlWithSearchParams } from './api-helpers'

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {messageType} type - The type of message e.g 'error'.
 * @param {string} path - The path to redirect to.
 * @param {messageCode} message - The message code to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 * @deprecated Use buildUrlWithSearchParams instead.
 */
export function encodedRedirect(type: messageType, path: string, message: messageCode) {
  return redirect(
    buildUrlWithSearchParams(path, {
      [PARAMS.MESSAGE_TYPE]: type,
      [PARAMS.AUTH_MESSAGE_CODE]: message,
    })
  )
}
