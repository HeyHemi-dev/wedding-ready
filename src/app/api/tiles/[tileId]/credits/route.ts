import { NextResponse } from 'next/server'

import { ROUTE_ERRORS } from '@/app/_types/errors'
import { TileCredit } from '@/app/_types/tiles'
import { tileCreditFormSchema, TileCreditForm } from '@/app/_types/validation-schema'
import { tileOperations } from '@/operations/tile-operations'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export type TileCreditGetResponseBody = TileCredit[]
export type TileCreditPostRequestBody = TileCreditForm
export type TileCreditPostResponseBody = TileCredit

export async function GET(_req: Request, { params }: { params: Promise<{ tileId: string }> }): Promise<NextResponse> {
  const { tileId } = await params
  const { data, error } = await tryCatch(tileOperations.getCreditsForTile(tileId))
  if (error) {
    return ROUTE_ERRORS.INTERNAL_SERVER_ERROR
  }
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ tileId: string }> }): Promise<NextResponse> {
  const { tileId } = await params

  // Validate the request body
  const body = (await req.json()) as TileCreditPostRequestBody
  const parsed = tileCreditFormSchema.safeParse(body)
  if (!parsed.success) {
    return ROUTE_ERRORS.INVALID_REQUEST
  }

  // Only the person who created the tile can add a credit
  const tile = await tileOperations.getById(tileId)
  const authUserId = await getAuthUserId()
  if (!authUserId || tile.createdByUserId != authUserId) {
    return ROUTE_ERRORS.UNAUTHORIZED
  }

  const { data, error } = await tryCatch(tileOperations.createCreditForTile({ tileId, credit: parsed.data, userId: authUserId }))
  if (error) {
    return ROUTE_ERRORS.INTERNAL_SERVER_ERROR
  }
  return NextResponse.json(data)
}
