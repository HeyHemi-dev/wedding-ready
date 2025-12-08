import { HTTP_ERROR } from '@/app/_types/errors'
import { TileSaveState, tileSaveStateSchema } from '@/app/_types/validation-schema'
import { savedTilesModel } from '@/models/saved-tiles'
import * as t from '@/models/types'
import { tileOperations } from '@/operations/tile-operations'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'
import { NextResponse } from 'next/server'

export type SaveTileGetResponseBody = TileSaveState

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

export type SaveTilePostRequestBody = TileSaveState
export type SaveTilePostResponseBody = TileSaveState

// Save/unsave a tile
export async function POST(req: Request, { params }: { params: Promise<{ id: string; tileId: string }> }): Promise<NextResponse> {
  const { id, tileId } = await params

  const { data: body, error: parseError } = await tryCatch(req.json())
  if (parseError) return HTTP_ERROR.BAD_REQUEST()

  const parsed = tileSaveStateSchema.safeParse(body)
  if (!parsed.success) return HTTP_ERROR.BAD_REQUEST()

  const authUserId = await getAuthUserId()
  if (!authUserId || authUserId !== id) {
    return HTTP_ERROR.UNAUTHORIZED()
  }

  const { data: savedTile, error } = await tryCatch(tileOperations.upsertSavedState(tileId, authUserId, body.isSaved ?? true))
  if (error) return HTTP_ERROR.INTERNAL_SERVER_ERROR()

  return NextResponse.json(savedTile)
}
