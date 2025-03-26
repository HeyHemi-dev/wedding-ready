import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { isProtectedPath } from '@/utils/auth'

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
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
        response = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const user = await supabase.auth.getUser()

  // protected routes
  if (isProtectedPath(request.nextUrl.pathname) && user.error) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Only set the auth user header if we have one.
  // If we try to get the header later on and it doesn't exist then next/headers will return null.
  if (user.data.user) {
    response.headers.set('x-auth-user-id', user.data.user.id)
  }

  return response
}
