import { HTTP_ERROR } from '@/app/_types/errors'
import { savedTilesModel } from '@/models/saved-tiles'
import * as t from '@/models/types'
import { tileOperations } from '@/operations/tile-operations'
import { getAuthUserId } from '@/utils/auth'
import { NextResponse } from 'next/server'

export type SaveTileGetResponseBody = t.SavedTileRaw

// Get the saved state of a tile
export async function GET(req: Request, { params }: { params: Promise<{ id: string; tileId: string }> }): Promise<NextResponse> {
  const { id, tileId } = await params
  const authUserId = await getAuthUserId()
  if (!authUserId || authUserId !== id) {
    return HTTP_ERROR.UNAUTHORIZED()
  }

  const savedTile = await savedTilesModel.getRaw(tileId, id)

  return NextResponse.json(savedTile)
}

export type SaveTilePostRequestBody = t.SetSavedTileRaw
export type SaveTilePostResponseBody = t.SavedTileRaw

// Save/unsave a tile
export async function POST(req: Request, { params }: { params: Promise<{ id: string; tileId: string }> }): Promise<NextResponse> {
  const { id, tileId } = await params
  const body = (await req.json()) as SaveTilePostRequestBody

  const authUserId = await getAuthUserId()
  if (!authUserId || authUserId !== id) {
    return HTTP_ERROR.UNAUTHORIZED()
  }

  const savedTile = await tileOperations.upsertSavedState(tileId, authUserId, body.isSaved ?? true)

  return NextResponse.json(savedTile)
}
