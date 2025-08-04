import { NextRequest, NextResponse } from 'next/server'

import { tryCatch } from '@/utils/try-catch'
import { z } from 'zod'
import { parseQueryParams } from '@/utils/api-helpers'
import { SupplierSearchResult } from '@/app/_types/suppliers'
import { supplierOperations } from '@/operations/supplier-operations'
import { getAuthUserId } from '@/utils/auth'
import { ROUTE_ERRORS } from '@/app/_types/errors'

type ErrorResponse = {
  message: string
  error?: string
}

const supplierSearchGetRequestParams = z.object({
  q: z.string().optional(),
})

export type SupplierSearchGetRequestParams = z.infer<typeof supplierSearchGetRequestParams>

export type SupplierSearchGetResponseBody = SupplierSearchResult[]

export async function GET(req: NextRequest): Promise<NextResponse<SupplierSearchGetResponseBody | ErrorResponse>> {
  const userId = await getAuthUserId()

  if (!userId) {
    return ROUTE_ERRORS.UNAUTHORIZED
  }

  const parsedQueryParams = parseQueryParams(req.nextUrl, supplierSearchGetRequestParams)

  if (!parsedQueryParams.q || parsedQueryParams.q.trim().length === 0) {
    return NextResponse.json([])
  }

  const { data: suppliers, error } = await tryCatch(supplierOperations.search(parsedQueryParams.q.trim()))

  if (error) {
    return NextResponse.json({ message: 'Error searching suppliers', error: error.message } as ErrorResponse, { status: 500 })
  }

  return NextResponse.json(suppliers)
}
