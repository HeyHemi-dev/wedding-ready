import { NextResponse, NextRequest } from 'next/server'

import { FeedQueryResult } from '@/app/_types/tiles'
import { feedQuerySchema, FeedQuery } from '@/app/_types/validation-schema'
import { tileOperations } from '@/operations/tile-operations'
import { parseQueryParams } from '@/utils/api-helpers'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'
import { HTTP_ERROR } from '@/app/_types/errors'

export type FeedGetRequestParams = FeedQuery
export type FeedGetResponseBody = FeedQueryResult

export async function GET(req: NextRequest): Promise<NextResponse> {
  const parsedQueryParams = parseQueryParams(req.nextUrl, feedQuerySchema)
  const authUserId = await getAuthUserId()

  const { data, error } = await tryCatch(tileOperations.getFeed(parsedQueryParams, authUserId ?? undefined))

  if (error) {
    return HTTP_ERROR.INTERNAL_SERVER_ERROR()
  }

  const feed: FeedGetResponseBody = data

  return NextResponse.json(feed)
}
