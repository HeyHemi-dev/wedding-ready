import { NextResponse, NextRequest } from 'next/server'

import { userProfileModel } from '@/models/user'
import { ErrorResponse } from '@/utils/api-helpers'
import { tryCatch } from '@/utils/try-catch'

export type HandleGetResponseBody = {
  isAvailable: boolean
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ handle: string }> }): Promise<NextResponse<HandleGetResponseBody | ErrorResponse>> {
  const handle = (await params).handle

  const { data: isAvailable, error } = await tryCatch(userProfileModel.isHandleAvailable(handle))

  if (error) {
    return NextResponse.json({ message: 'Error checking handle availability' }, { status: 500 })
  }

  return NextResponse.json({ isAvailable })
}
