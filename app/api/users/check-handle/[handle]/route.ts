import { NextResponse, NextRequest } from 'next/server'

import { ErrorResponse } from '@/utils/api-helpers'
import { tryCatch } from '@/utils/try-catch'
import { UserDetailModel } from '@/models/user'

export type HandleGetResponseBody = {
  isAvailable: boolean
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ handle: string }> }): Promise<NextResponse<HandleGetResponseBody | ErrorResponse>> {
  const handle = (await params).handle

  const { data: isAvailable, error } = await tryCatch(UserDetailModel.isHandleAvailable({ handle }))

  if (error) {
    return NextResponse.json({ message: 'Error checking handle availability' }, { status: 500 })
  }

  return NextResponse.json({ isAvailable })
}
