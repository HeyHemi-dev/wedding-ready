import { SupplierModel } from '@/models/supplier'

import { NextResponse, NextRequest } from 'next/server'

import { tryCatch } from '@/utils/try-catch'
import { ErrorResponse } from '@/utils/api-helpers'
import { HandleGetResponseBody } from '@/app/_hooks/use-handle-availability'

export async function GET(req: NextRequest, { params }: { params: Promise<{ handle: string }> }): Promise<NextResponse<HandleGetResponseBody | ErrorResponse>> {
  const handle = (await params).handle

  const { data: isAvailable, error } = await tryCatch(SupplierModel.isHandleAvailable({ handle }))

  if (error) {
    return NextResponse.json({ message: 'Error checking handle availability' }, { status: 500 })
  }

  return NextResponse.json({ isAvailable })
}
