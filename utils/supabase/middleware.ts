import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { isProtectedPath, AuthHeaderName } from '@/utils/auth'

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  // IMPORTANT: DO NOT REMOVE auth.getUser()

  // getUser will refresh session if expired - required for Server Components
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // protected routes
  if (isProtectedPath(request.nextUrl.pathname) && error) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Only set the auth user header if we have one.
  // If we try to get the header later on and it doesn't exist then next/headers will return null.
  if (user) {
    supabaseResponse.headers.set(AuthHeaderName, user.id)
  }

  // IMPORTANT: You must return the supabaseResponse object as is to maintain session state
  return supabaseResponse
}
