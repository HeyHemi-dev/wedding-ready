import { NextResponse, NextRequest } from 'next/server'

import { HTTP_ERROR } from '@/app/_types/errors'
import { FeedQueryResult } from '@/app/_types/tiles'
import { feedQuerySchema, FeedQuery } from '@/app/_types/validation-schema'
import { tileOperations } from '@/operations/tile-operations'
import { parseQueryParams } from '@/utils/api-helpers'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export type FeedGetRequestParams = FeedQuery
export type FeedGetResponseBody = FeedQueryResult

export async function GET(req: NextRequest): Promise<NextResponse> {
  const parsedQueryParams = parseQueryParams(req.nextUrl, feedQuerySchema)
  const authUserId = await getAuthUserId()

  if (!authUserId) {
    return HTTP_ERROR.UNAUTHORIZED()
  }

  const { data, error } = await tryCatch(tileOperations.getFeedForUser(authUserId, parsedQueryParams))

  if (error) {
    return HTTP_ERROR.INTERNAL_SERVER_ERROR()
  }

  const feed: FeedGetResponseBody = data

  return NextResponse.json(feed)
}
