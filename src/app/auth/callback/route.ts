import { NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Support both 'redirect_to' (existing) and 'next' (Google OAuth standard) parameters
  const redirectTo = searchParams.get('redirect_to') ?? searchParams.get('next')
  let next = redirectTo ?? '/feed'

  // Ensure next is a relative URL starting with '/'
  if (!next.startsWith('/')) {
    next = '/feed'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      // Redirect to sign-in with error message using the established pattern
      return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent('Authentication failed. Please try again.')}`)
    }

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
  return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent('Invalid authentication request. Please try signing in again.')}`)
}
