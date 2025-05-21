import { type NextRequest } from 'next/server'

import { updateSession } from '@/utils/supabase/middleware'

/**
 * Next.js middleware that runs before the route code (page or api route) for every request.
 *
 * @important Keep middleware as simple as possible, because it runs on every request and is very hard to debug.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // We do not use matcher for defining protected routes
  // The updateSession function has isProtectedPath logic
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// Good use cases for Next.js middleware:
// 1. Authentication & redirects – Redirect unauthenticated users
// 2. Role-based access – Restrict routes based on user roles or permissions.
// 3. A/B testing – Serve different versions of a page using cookies or headers.
// 4. Locale routing – Detect language preferences and rewrite paths (e.g., /en, /fr).
// 5. Bot detection – Block or redirect known bots and scrapers.
// 6. Custom headers – Add headers like Content-Security-Policy for security.
// 7. Logging/analytics – Log requests or inject tracking before page render.
