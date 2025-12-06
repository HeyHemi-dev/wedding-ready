import { savedTilesModel } from '@/models/saved-tiles'
import * as t from '@/models/types'
import { getAuthUserId } from '@/utils/auth'

export type SaveTileGetResponseBody = t.SavedTileRaw

// Get the saved state of a tile
export async function GET(req: Request, { params }: { params: Promise<{ id: string; tileId: string }> }): Promise<Response> {
  const { id, tileId } = await params
  const authUserId = await getAuthUserId()
  if (!authUserId || authUserId !== id) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const savedTile = await savedTilesModel.getRaw(tileId, id)

  return Response.json(savedTile)
}

export type SaveTilePostRequestBody = t.SetSavedTileRaw
export type SaveTilePostResponseBody = t.SavedTileRaw

// Save/unsave a tile
export async function POST(req: Request, { params }: { params: Promise<{ id: string; tileId: string }> }): Promise<Response> {
  const { id, tileId } = await params
  const body = (await req.json()) as SaveTilePostRequestBody

  const authUserId = await getAuthUserId()
  if (!authUserId || authUserId !== id) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const savedTile = await savedTilesModel.upsertRaw({ tileId, userId: authUserId, isSaved: body.isSaved ?? true })

  return Response.json(savedTile)
}
