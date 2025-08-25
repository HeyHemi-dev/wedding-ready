import { NextResponse } from 'next/server'

import * as t from '@/models/types'
import { tileOperations } from '@/operations/tile-operations'
import { getAuthUserId } from '@/utils/auth'
import { Supplier } from '@/app/_types/suppliers'

export interface tileNewRequestBody extends t.InsertTileRaw {
  suppliers: Supplier[]
}

export type tileNewResponseBody = { id: string }

// Create a new tile
export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as tileNewRequestBody

  const authUserId = await getAuthUserId()
  if (!authUserId || authUserId !== body.createdByUserId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { suppliers, ...rest } = body

  const tile = await tileOperations.createForSupplier({ InsertTileRawData: rest, supplierIds: suppliers.map((s) => s.id) })

  return NextResponse.json({ id: tile.id })
}
