import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { ROUTE_ERROR } from '@/app/_types/errors'
import { SupplierSearchResult } from '@/app/_types/suppliers'
import { supplierOperations } from '@/operations/supplier-operations'
import { parseQueryParams } from '@/utils/api-helpers'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

const supplierSearchGetRequestParams = z.object({
  q: z.string().optional(),
})
export type SupplierSearchGetRequestParams = z.infer<typeof supplierSearchGetRequestParams>
export type SupplierSearchGetResponseBody = SupplierSearchResult[]

export async function GET(req: NextRequest): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return ROUTE_ERROR.NOT_AUTHENTICATED()

  const parsedQueryParams = parseQueryParams(req.nextUrl, supplierSearchGetRequestParams)

  if (!parsedQueryParams.q || parsedQueryParams.q.trim().length === 0) {
    return NextResponse.json([])
  }

  const { data: suppliers, error } = await tryCatch(supplierOperations.search(parsedQueryParams.q.trim()))
  if (error) return ROUTE_ERROR.INTERNAL_SERVER_ERROR()

  return NextResponse.json(suppliers)
}
