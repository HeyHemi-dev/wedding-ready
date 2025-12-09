import { NextResponse, NextRequest } from 'next/server'
import z from 'zod'

import { HTTP_ERROR } from '@/app/_types/errors'
import { FeedQueryResult } from '@/app/_types/tiles'
import { tileOperations } from '@/operations/tile-operations'
import { parseQueryParams } from '@/utils/api-helpers'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export const feedGetRequestSchema = z.object({
  pageSize: z.coerce.number().int().positive(),
})
export type FeedGetRequest = z.infer<typeof feedGetRequestSchema>
export type FeedGetResponse = FeedQueryResult

export async function GET(req: NextRequest): Promise<NextResponse> {
  const parsedQueryParams = parseQueryParams(req.nextUrl, feedGetRequestSchema)
  const authUserId = await getAuthUserId()

  if (!authUserId) {
    return HTTP_ERROR.UNAUTHORIZED()
  }

  const { data, error } = await tryCatch(tileOperations.getFeedForUser(authUserId, parsedQueryParams.pageSize))

  if (error) {
    return HTTP_ERROR.INTERNAL_SERVER_ERROR()
  }

  const feed: FeedGetResponse = data

  return NextResponse.json(feed)
}
