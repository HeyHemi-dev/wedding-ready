'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { removeSearchParam } from '@/utils/api-helpers'
import { PARAMS, SIGN_IN_METHODS } from '@/utils/constants'
import { saveLastSignInMethod } from '@/utils/local-storage'

/**
 * Client component that handles OAuth provider query parameter from callback redirect.
 * Saves the sign-in method to localStorage and removes the query parameter from URL.
 */
export function OAuthProviderHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const oauthProvider = searchParams.get(PARAMS.OAUTH_PROVIDER)

    if (oauthProvider === SIGN_IN_METHODS.GOOGLE) {
      saveLastSignInMethod(SIGN_IN_METHODS.GOOGLE)

      // Remove the query parameter from URL without causing a page reload
      const cleanedUrl = removeSearchParam(window.location.pathname + window.location.search, PARAMS.OAUTH_PROVIDER)
      router.replace(cleanedUrl, { scroll: false })
    }
  }, [searchParams, router])

  return null
}
