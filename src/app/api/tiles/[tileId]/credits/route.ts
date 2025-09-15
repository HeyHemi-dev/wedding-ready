import { NextResponse } from 'next/server'

import { HTTP_ERROR } from '@/app/_types/errors'
import { TileCredit } from '@/app/_types/tiles'
import { tileCreditFormSchema, TileCreditForm } from '@/app/_types/validation-schema'
import { tileOperations } from '@/operations/tile-operations'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export type TileCreditGetResponseBody = TileCredit[]
export type TileCreditPostRequestBody = TileCreditForm
export type TileCreditPostResponseBody = TileCredit[]

export async function GET(_req: Request, { params }: { params: Promise<{ tileId: string }> }): Promise<NextResponse> {
  const { tileId } = await params
  const { data, error } = await tryCatch(tileOperations.getCreditsForTile(tileId))
  if (error) return HTTP_ERROR.INTERNAL_SERVER_ERROR()

  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ tileId: string }> }): Promise<NextResponse> {
  const { tileId } = await params

  const body = (await req.json()) as TileCreditPostRequestBody
  const parsed = tileCreditFormSchema.safeParse(body)
  if (!parsed.success) return HTTP_ERROR.BAD_REQUEST()

  const authUserId = await getAuthUserId()
  if (!authUserId) return HTTP_ERROR.UNAUTHORIZED()

  const { data, error } = await tryCatch(tileOperations.createCreditForTile({ tileId, credit: parsed.data, authUserId }))
  if (error) return HTTP_ERROR.INTERNAL_SERVER_ERROR()

  return NextResponse.json(data)
}
