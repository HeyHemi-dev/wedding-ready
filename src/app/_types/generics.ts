import { NextResponse } from 'next/server'

export type Href = {
  href: string
  label: string
}

export type HttpErrorResponseBody = {
  code: string
  message?: string
}

export type SearchParams = Record<string, string | string[] | undefined>

/**
 * Helper type for API route responses that can return either a success body or an HTTP error.
 * Use this type for the return type of route handlers.
 *
 * @example
 * export type MyRouteResponseBody = { data: string }
 * export async function GET(): Promise<RouteResponse<MyRouteResponseBody>> {
 *   return NextResponse.json({ data: 'success' })
 *   // or return HTTP_ERROR.BAD_REQUEST()
 * }
 */
export type RouteResponse<T> = NextResponse<T | HttpErrorResponseBody>
