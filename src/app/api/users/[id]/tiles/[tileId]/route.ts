import { NextResponse } from 'next/server'

import { HTTP_ERROR } from '@/app/_types/errors'
import { RouteResponse } from '@/app/_types/generics'
import { TileSaveState, tileSaveStateSchema } from '@/app/_types/validation-schema'
import { savedTilesModel } from '@/models/saved-tiles'
import { tileOperations } from '@/operations/tile-operations'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

export type SaveTileGetResponseBody = TileSaveState

// Get the saved state of a tile
export async function GET(req: Request, { params }: { params: Promise<{ id: string; tileId: string }> }): Promise<RouteResponse<SaveTileGetResponseBody>> {
  const { id, tileId } = await params

  const authUserId = await getAuthUserId()
  if (!authUserId || authUserId !== id) {
    return HTTP_ERROR.UNAUTHORIZED()
  }

  const { data: savedTile, error } = await tryCatch(savedTilesModel.getRaw(tileId, id))
  if (error) return HTTP_ERROR.INTERNAL_SERVER_ERROR()

  return NextResponse.json({ isSaved: savedTile?.isSaved ?? false })
}

export type SaveTilePostRequestBody = TileSaveState
export type SaveTilePostResponseBody = TileSaveState

// Save/unsave a tile
export async function POST(req: Request, { params }: { params: Promise<{ id: string; tileId: string }> }): Promise<RouteResponse<SaveTilePostResponseBody>> {
  const { id, tileId } = await params

  const { data: body, error: parseError } = await tryCatch(req.json())
  if (parseError) return HTTP_ERROR.BAD_REQUEST()

  const { data: validated, success } = tileSaveStateSchema.safeParse(body)
  if (!success) return HTTP_ERROR.BAD_REQUEST()

  const authUserId = await getAuthUserId()
  if (!authUserId || authUserId !== id) {
    return HTTP_ERROR.UNAUTHORIZED()
  }

  const { data: saveState, error } = await tryCatch(tileOperations.upsertSaveState(tileId, authUserId, validated.isSaved))
  if (error) return HTTP_ERROR.INTERNAL_SERVER_ERROR()

  return NextResponse.json(saveState)
}
