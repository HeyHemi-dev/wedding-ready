import { NextResponse } from 'next/server'

import { tileCreditFormSchema, TileCreditForm } from '@/app/_types/validation-schema'
import { TileModel } from '@/models/tile'
import { tileOperations } from '@/operations/tile-operations'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export type TileCreditGetResponseBody = Awaited<ReturnType<typeof TileModel.getCredits>>
export type TileCreditPostRequestBody = TileCreditForm
export type TileCreditPostResponseBody = Awaited<ReturnType<typeof tileOperations.addCredit>>

export async function GET(_req: Request, { params }: { params: Promise<{ tileId: string }> }): Promise<NextResponse> {
  const { tileId } = await params
  const { data, error } = await tryCatch(TileModel.getCredits(tileId))
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
  const { data, error } = await tryCatch(
    tileOperations.addCredit({ tileId, credit: parsed.data, userId: authUserId })
  )
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
