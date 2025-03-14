import { NextResponse } from 'next/server'
import { TileModel } from '@/models/tile'
import { getCurrentUser } from '@/actions/get-current-user'
import { Supplier, TileRaw, TileRawWithSuppliers } from '@/models/types'

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

  const tile: tileNewResponseBody = await TileModel.createRawWithSuppliers(
    {
      createdByUserId: user.id,
      title: body.title,
    },
    body.suppliers
  )
  console.log('tile created', tile)
  return NextResponse.json(tile)
}

export interface tilesUpdateRequestBody {
  tiles: TileRaw[]
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
  console.log('tiles update request body', body.tiles)
  const tiles = await TileModel.updateAllRaw(body.tiles)
  console.log('tiles updated', tiles)
  return NextResponse.json({ tileIds: tiles.map((tile) => tile.id) } as tilesUpdateResponseBody)
}
