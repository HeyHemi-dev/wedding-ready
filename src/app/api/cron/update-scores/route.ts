import { tileOperations } from '@/operations/tile-operations'
import { RouteResponse } from '@/app/_types/generics'

import { NextResponse, type NextRequest } from 'next/server'
import { HTTP_ERROR } from '@/app/_types/errors'
import { tryCatch } from '@/utils/try-catch'

export async function GET(request: NextRequest): Promise<RouteResponse<{ success: boolean }>> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return HTTP_ERROR.UNAUTHORIZED()
  }
  const { error } = await tryCatch(tileOperations.updateScores())
  if (error) return HTTP_ERROR.INTERNAL_SERVER_ERROR()

  return NextResponse.json({ success: true })
}
