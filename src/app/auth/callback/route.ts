import { NextResponse } from 'next/server'
import z from 'zod'

import { MESSAGE_CODES } from '@/components/auth/auth-message'
import { authOperations, SIGN_UP_STATUS } from '@/operations/auth-operations'
import { buildUrlWithSearchParams, getNextUrl, parseSearchParams, urlSearchParamsToObject } from '@/utils/api-helpers'
import { PARAMS } from '@/utils/constants'
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

  // If no code, redirect to sign-in with error
  if (!codeData) {
    return NextResponse.redirect(
      buildUrlWithSearchParams(`${origin}/sign-in`, {
        [PARAMS.AUTH_MESSAGE_CODE]: MESSAGE_CODES.INVALID_AUTH_REQUEST,
        [PARAMS.MESSAGE_TYPE]: 'error',
        [PARAMS.NEXT]: next,
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
        [PARAMS.NEXT]: next,
      })
    )
  }

  // Get auth user
  const { data, error: getUserSignUpStatusError } = await tryCatch(authOperations.getUserSignUpStatus(supabase))

  if (getUserSignUpStatusError || !data) {
    return NextResponse.redirect(
      buildUrlWithSearchParams(`${origin}/sign-in`, {
        [PARAMS.AUTH_MESSAGE_CODE]: MESSAGE_CODES.AUTH_FAILED,
        [PARAMS.MESSAGE_TYPE]: 'error',
        [PARAMS.NEXT]: next,
      })
    )
  }

  if (data.status === SIGN_UP_STATUS.UNVERIFIED) {
    // Redirect to check inbox page
    return NextResponse.redirect(
      buildUrlWithSearchParams(`${origin}/sign-up/check-inbox`, {
        [PARAMS.NEXT]: next,
      })
    )
  }

  if (data.status !== SIGN_UP_STATUS.ONBOARDED) {
    // Redirect to onboarding, preserve original destination
    return NextResponse.redirect(
      buildUrlWithSearchParams(`${origin}/onboarding`, {
        [PARAMS.NEXT]: next,
      })
    )
  }

  // Profile exists, proceed with normal redirect
  // Handle load balancer redirects in production
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  if (isLocalEnv) {
    // No load balancer in development, use origin directly
    return NextResponse.redirect(`${origin}${next}`)
  } else if (forwardedHost) {
    // Use forwarded host if available (behind load balancer)
    return NextResponse.redirect(`https://${forwardedHost}${next}`)
  } else {
    // Fallback to origin
    return NextResponse.redirect(`${origin}${next}`)
  }
}
