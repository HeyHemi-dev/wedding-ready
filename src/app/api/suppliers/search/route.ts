import { NextRequest, NextResponse } from 'next/server'

import { ROUTE_ERROR } from '@/app/_types/errors'
import { supplierOperations } from '@/operations/supplier-operations'
import { parseQueryParams } from '@/utils/api-helpers'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

import { supplierSearchGetRequestSchema } from './types'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return ROUTE_ERROR.NOT_AUTHENTICATED()

  const parsedQueryParams = parseQueryParams(req.nextUrl, supplierSearchGetRequestSchema)

  if (!parsedQueryParams.q || parsedQueryParams.q.trim().length === 0) {
    return NextResponse.json([])
  }

  const { data: suppliers, error } = await tryCatch(supplierOperations.search(parsedQueryParams.q.trim()))
  if (error) return ROUTE_ERROR.INTERNAL_SERVER_ERROR()

  return NextResponse.json(suppliers)
}
