import { NextResponse, NextRequest } from 'next/server'
import { TileModel } from '@/models/tile'
import { parseQueryParams } from '@/utils/api-helpers'
import { z } from 'zod'
import * as t from '@/models/types'
import { getAuthenticatedUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

const tilesGetRequestParams = z.object({
  userId: z.string().optional(),
})

export type TilesGetRequestParams = z.infer<typeof tilesGetRequestParams>

export type TilesGetResponseBody = t.Tile[]

export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const supplierId = params.id
  const { userId } = parseQueryParams(req.nextUrl, tilesGetRequestParams)

  // Only check authentication if a userId is provided
  if (userId) {
    const authUserId = await getAuthenticatedUserId()
    if (!authUserId || authUserId !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
  }

  const { data, error } = await tryCatch(TileModel.getBySupplierId(supplierId, userId))

  if (error) {
    return NextResponse.json({ message: 'Error fetching tiles', error: error.message }, { status: 500 })
  }

  const tiles: TilesGetResponseBody = data

  return NextResponse.json(tiles)
}
