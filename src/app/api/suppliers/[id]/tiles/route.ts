import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod'

import { TileListItem } from '@/app/_types/tiles'
import { tileOperations } from '@/operations/tile-operations'
import { parseQueryParams } from '@/utils/api-helpers'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export const supplierTilesGetRequestSchema = z.object({
  authUserId: z.string().optional(),
})
export type SupplierTilesGetRequest = z.infer<typeof supplierTilesGetRequestSchema>
export type SupplierTilesGetResponse = TileListItem[]

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const supplierId = (await params).id
  const parsedQueryParams = parseQueryParams(req.nextUrl, supplierTilesGetRequestSchema)

  // Only check authentication if an authUserId is provided
  if (parsedQueryParams.authUserId) {
    const authUserId = await getAuthUserId()
    if (!authUserId || authUserId !== parsedQueryParams.authUserId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
  }

  const { data, error } = await tryCatch(tileOperations.getListForSupplier(supplierId, parsedQueryParams.authUserId))

  if (error) {
    return NextResponse.json({ message: 'Error fetching tiles', error: error.message }, { status: 500 })
  }

  const tiles: SupplierTilesGetResponse = data

  return NextResponse.json(tiles)
}
