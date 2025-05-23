import { NextResponse } from 'next/server'

import { TileModel } from '@/models/tile'
import * as t from '@/models/types'
import { getAuthUserId } from '@/utils/auth'


export interface tileNewRequestBody extends t.InsertTileRaw {
  suppliers: t.SupplierRaw[]
}

export type tileNewResponseBody = t.TileRawWithSuppliers

// Create a new tile
export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as tileNewRequestBody

  const authUserId = await getAuthUserId()
  if (!authUserId || authUserId !== body.createdByUserId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { suppliers, ...rest } = body

  const tile: tileNewResponseBody = await TileModel.createRawWithSuppliers(rest, suppliers)

  return NextResponse.json(tile)
}
