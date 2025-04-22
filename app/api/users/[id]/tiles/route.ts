import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod'

import { TileModel } from '@/models/tile'
import * as t from '@/models/types'
import { parseQueryParams } from '@/utils/api-helpers'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

const userTilesGetRequestParams = z.object({
  authUserId: z.string().optional(),
})

export type UserTilesGetRequestParams = z.infer<typeof userTilesGetRequestParams>

export type UserTilesGetResponseBody = t.Tile[]

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const userId = (await params).id
  const parsedQueryParams = parseQueryParams(req.nextUrl, userTilesGetRequestParams)

  // Only check authentication if an authUserId is provided
  if (parsedQueryParams.authUserId) {
    const authUserId = await getAuthUserId()
    if (!authUserId || authUserId !== parsedQueryParams.authUserId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
  }

  const { data, error } = await tryCatch(TileModel.getByUserId(userId, parsedQueryParams.authUserId))

  if (error) {
    return NextResponse.json({ message: 'Error fetching tiles', error: error.message }, { status: 500 })
  }

  const tiles: UserTilesGetResponseBody = data

  return NextResponse.json(tiles)
}
