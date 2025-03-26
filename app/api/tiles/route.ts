import { NextResponse } from 'next/server'
import { TileModel } from '@/models/tile'
import * as types from '@/models/types'
import { getAuthenticatedUserId } from '@/utils/auth'

export interface tileNewRequestBody extends types.InsertTileRaw {
  suppliers: types.SupplierRaw[]
}

export type tileNewResponseBody = types.TileRawWithSuppliers

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as tileNewRequestBody
  const authUserId = await getAuthenticatedUserId()
  if (!authUserId || authUserId !== body.createdByUserId) {
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
  const authUserId = await getAuthenticatedUserId()
  if (!authUserId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const tiles = await TileModel.updateAllRaw(body.tiles)

  return NextResponse.json({ tileIds: tiles.map((tile) => tile.id) } as tilesUpdateResponseBody)
}
