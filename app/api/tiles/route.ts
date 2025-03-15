import { NextResponse } from 'next/server'
import { TileModel } from '@/models/tile'
import { getCurrentUser } from '@/actions/get-current-user'
import * as types from '@/models/types'

export interface tileNewRequestBody extends types.InsertTileRaw {
  suppliers: types.Supplier[]
}

export type tileNewResponseBody = types.TileRawWithSuppliers

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as tileNewRequestBody
  const user = await getCurrentUser()
  if (!user || user.id !== body.createdByUserId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { suppliers, ...rest } = body

  const tile: tileNewResponseBody = await TileModel.createRawWithSuppliers(rest, suppliers)

  return NextResponse.json(tile)
}

export interface tilesUpdateRequestBody {
  tiles: types.TileRaw[]
}

export interface tilesUpdateResponseBody {
  tileIds: string[]
}

export async function PUT(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as tilesUpdateRequestBody
  const user = await getCurrentUser()
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const tiles = await TileModel.updateAllRaw(body.tiles)

  return NextResponse.json({ tileIds: tiles.map((tile) => tile.id) } as tilesUpdateResponseBody)
}
