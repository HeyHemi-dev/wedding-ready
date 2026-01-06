import { NextResponse } from 'next/server'
import z from 'zod'

import { SearchParams } from '@/app/_types/generics'
import { MESSAGE_CODES } from '@/components/auth/auth-message'
import { authOperations, SIGN_UP_STATUS } from '@/operations/auth-operations'
import { buildUrlWithSearchParams, getNextUrl, parseSearchParams, urlSearchParamsToObject } from '@/utils/api-helpers'
import { PARAMS, SIGN_IN_METHODS } from '@/utils/constants'
import { createClient } from '@/utils/supabase/server'
import { tryCatch } from '@/utils/try-catch'

const codeSchema = z.object({ code: z.string().min(1) })

export async function GET(request: Request): Promise<NextResponse> {
  // The `/auth/callback` route is required for the server-side auth flow implemented by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { searchParams, origin } = new URL(request.url)
  const searchParamsObject = urlSearchParamsToObject(searchParams)
  const { data: codeData } = await tryCatch(parseSearchParams(searchParamsObject, codeSchema))
  const next = await getNextUrl(searchParamsObject)
  const nextParams: SearchParams = {
    [PARAMS.NEXT]: next,
  }

  // If no code, redirect to sign-in with error
  if (!codeData) {
    return NextResponse.redirect(
      buildUrlWithSearchParams(`${origin}/sign-in`, {
        [PARAMS.AUTH_MESSAGE_CODE]: MESSAGE_CODES.INVALID_AUTH_REQUEST,
        [PARAMS.MESSAGE_TYPE]: 'error',
        ...nextParams,
      })
    )
  }

  const supabase = await createClient()
  const { error: exchangeCodeError } = await tryCatch(supabase.auth.exchangeCodeForSession(codeData.code))

  if (exchangeCodeError) {
    // Redirect to sign-in with error message using the established pattern
    return NextResponse.redirect(
      buildUrlWithSearchParams(`${origin}/sign-in`, {
        [PARAMS.AUTH_MESSAGE_CODE]: MESSAGE_CODES.AUTH_FAILED,
        [PARAMS.MESSAGE_TYPE]: 'error',
        ...nextParams,
      })
    )
  }

  // Pass to AppEffects to handle persistence of last sign-in method for OAuth providers
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isGoogleOAuth = user?.app_metadata?.provider === SIGN_IN_METHODS.GOOGLE
  if (isGoogleOAuth) {
    nextParams[PARAMS.OAUTH_PROVIDER] = SIGN_IN_METHODS.GOOGLE
  }

  // Get auth user
  const { data, error: getUserSignUpStatusError } = await tryCatch(authOperations.getUserSignUpStatus(supabase))

  if (getUserSignUpStatusError || !data) {
    return NextResponse.redirect(
      buildUrlWithSearchParams(`${origin}/sign-in`, {
        [PARAMS.AUTH_MESSAGE_CODE]: MESSAGE_CODES.AUTH_FAILED,
        [PARAMS.MESSAGE_TYPE]: 'error',
        ...nextParams,
      })
    )
  }

  if (data.status === SIGN_UP_STATUS.UNVERIFIED) {
    // Redirect to check inbox page
    return NextResponse.redirect(
      buildUrlWithSearchParams(`${origin}/sign-up/check-inbox`, {
        ...nextParams,
      })
    )
  }

  if (data.status !== SIGN_UP_STATUS.ONBOARDED) {
    // Redirect to onboarding, preserve original destination
    return NextResponse.redirect(
      buildUrlWithSearchParams(`${origin}/onboarding`, {
        ...nextParams,
      })
    )
  }

  // Profile exists, proceed with normal redirect
  // Handle load balancer redirects in production
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  let redirectUrl: string
  if (isLocalEnv) {
    // No load balancer in development, use origin directly
    redirectUrl = `${origin}${next}`
  } else if (forwardedHost) {
    // Use forwarded host if available (behind load balancer)
    redirectUrl = `https://${forwardedHost}${next}`
  } else {
    // Fallback to origin
    redirectUrl = `${origin}${next}`
  }

  // Add OAuth provider param if present
  if (isGoogleOAuth) {
    redirectUrl = buildUrlWithSearchParams(redirectUrl, {
      [PARAMS.OAUTH_PROVIDER]: SIGN_IN_METHODS.GOOGLE,
    })
  }

  return NextResponse.redirect(redirectUrl)
}
