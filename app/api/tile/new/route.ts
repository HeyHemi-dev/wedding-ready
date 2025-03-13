import { NextResponse } from 'next/server'
import { TileModel } from '@/models/tile'
import { getCurrentUser } from '@/actions/get-current-user'
import { Supplier, TileRawWithSuppliers } from '@/models/types'

export interface tileNewRequestBody {
  title: string
  createdByUserId: string
  suppliers: Supplier[]
}

export type tileNewResponseBody = TileRawWithSuppliers

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as tileNewRequestBody
  const user = await getCurrentUser()
  if (!user || user.id !== body.createdByUserId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const tile = await TileModel.createRawWithSuppliers(
    {
      createdByUserId: user.id,
      title: body.title,
    },
    body.suppliers
  )
  console.log('tile created', tile)
  return NextResponse.json(tile)
}
