import { NextResponse, NextRequest } from 'next/server'
import { TileModel } from '@/models/tile'
import { parseQueryParams } from '@/utils/api-helpers'
import { z } from 'zod'
import * as t from '@/models/types'
import { getAuthenticatedUserId } from '@/utils/auth'

import { tryCatch } from '@/utils/try-catch'

export const tilesGetRequestParams = z.object({
  supplierId: z.string(),
  userId: z.string().optional(),
})

export type tilesGetResponseBody = t.Tile[]

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authUserId = await getAuthenticatedUserId()
  const { supplierId, userId } = parseQueryParams(req.nextUrl, tilesGetRequestParams)

  if (!supplierId) {
    return new NextResponse('Missing supplierId', { status: 400 })
  }

  if (userId && authUserId !== userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data, error } = await tryCatch(TileModel.getBySupplierId(supplierId, userId))

  if (error) {
    return new NextResponse('Error fetching tiles', { status: 500 })
  }

  const tiles: tilesGetResponseBody = data

  return NextResponse.json(tiles)
}

export interface tileNewRequestBody extends t.InsertTileRaw {
  suppliers: t.SupplierRaw[]
}

export type tileNewResponseBody = t.TileRawWithSuppliers

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
  tiles: t.TileRaw[]
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
