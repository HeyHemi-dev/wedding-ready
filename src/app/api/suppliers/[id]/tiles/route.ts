import { NextResponse, NextRequest } from 'next/server'

import { tileOperations } from '@/operations/tile-operations'
import { parseQueryParams, parseSearchParams, urlSearchParamsToObject } from '@/utils/api-helpers'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

import { supplierTilesGetRequestSchema, type SupplierTilesGetResponse } from './types'
import { SearchParams } from '@/app/_types/generics'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const supplierId = (await params).id

  const searchParams = urlSearchParamsToObject(req.nextUrl.searchParams)
  const { data: parsedParams } = await tryCatch(parseSearchParams(searchParams, supplierTilesGetRequestSchema))

  // Only check authentication if an authUserId is provided
  if (parsedParams) {
    const authUserId = await getAuthUserId()
    if (!authUserId || authUserId !== parsedParams.authUserId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
  }

  const { data, error } = await tryCatch(tileOperations.getListForSupplier(supplierId, parsedParams?.authUserId))

  if (error) {
    return NextResponse.json({ message: 'Error fetching tiles', error: error.message }, { status: 500 })
  }

  const tiles: SupplierTilesGetResponse = data

  return NextResponse.json(tiles)
}
