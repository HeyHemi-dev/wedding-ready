'use client'

import React from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { removeSearchParam } from '@/utils/api-helpers'
import { PARAMS, SIGN_IN_METHODS } from '@/utils/constants'
import { saveLastSignInMethod } from '@/utils/local-storage'

export function AppEffects(): React.ReactNode {
  return <PersistLastSignInMethodEffect />
}

/**
 * Side effect to save the last sign-in method to localStorage for OAuth providers.
 */
function PersistLastSignInMethodEffect() {
  const searchParams = useSearchParams()
  const router = useRouter()

  React.useEffect(() => {
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
