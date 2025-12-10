import { NextResponse, NextRequest } from 'next/server'

import { tileOperations } from '@/operations/tile-operations'
import { parseQueryParams } from '@/utils/api-helpers'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

import { userTilesGetRequestSchema, type UserTilesGetResponse } from './types'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const userId = (await params).id
  const parsedQueryParams = parseQueryParams(req.nextUrl, userTilesGetRequestSchema)

  // Only check authentication if an authUserId is provided
  if (parsedQueryParams.authUserId) {
    const authUserId = await getAuthUserId()
    if (!authUserId || authUserId !== parsedQueryParams.authUserId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
  }

  const { data, error } = await tryCatch(tileOperations.getListForUser(userId, parsedQueryParams.authUserId))

  if (error) {
    return NextResponse.json({ message: 'Error fetching tiles', error: error.message }, { status: 500 })
  }

  const tiles: UserTilesGetResponse = data

  return NextResponse.json(tiles)
}
