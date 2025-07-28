import { NextResponse } from 'next/server'

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
    return NextResponse.json({ message: 'Error fetching credits' }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ tileId: string }> }): Promise<NextResponse> {
  const { tileId } = await params
  const body = (await req.json()) as TileCreditPostRequestBody
  const parsed = tileCreditFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  }
  const authUserId = await getAuthUserId()
  if (!authUserId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const { data, error } = await tryCatch(tileOperations.createCreditForTile({ tileId, credit: parsed.data, userId: authUserId }))
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
