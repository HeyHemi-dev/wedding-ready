import { NextResponse } from 'next/server'

import { authOperations, SIGN_UP_STATUS } from '@/operations/auth-operations'
import { PARAMS } from '@/utils/constants'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  let next = searchParams.get(PARAMS.NEXT) ?? '/feed'

  // Ensure next is a relative URL starting with '/'
  if (!next.startsWith('/')) {
    next = '/feed'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      // Redirect to sign-in with error message using the established pattern
      return NextResponse.redirect(`${origin}/sign-in?${PARAMS.ERROR}=${encodeURIComponent('Authentication failed. Please try again.')}`)
    }

    // Get auth user

    const signUpStatus = await authOperations.getUserSignUpStatus(supabase)

    if (!signUpStatus) {
      return NextResponse.redirect(`${origin}/sign-in?${PARAMS.ERROR}=${encodeURIComponent('Authentication failed. Please try again.')}`)
    }

    if (signUpStatus.status === SIGN_UP_STATUS.UNVERIFIED) {
      // Redirect to check inbox page
      return NextResponse.redirect(`${origin}/check-inbox`)
    }

    if (signUpStatus.status !== SIGN_UP_STATUS.ONBOARDED) {
      // Redirect to onboarding, preserve original destination
      const onboardingUrl = new URL('/onboarding', origin)
      if (next !== '/feed') {
        onboardingUrl.searchParams.set(PARAMS.NEXT, next)
      }
      return NextResponse.redirect(onboardingUrl.toString())
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

  // If no code, redirect to sign-in with error
  return NextResponse.redirect(`${origin}/sign-in?${PARAMS.ERROR}=${encodeURIComponent('Invalid authentication request. Please try signing in again.')}`)
}
