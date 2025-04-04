import { TileModel } from '@/models/tile'
import * as t from '@/models/types'
import { getAuthenticatedUserId } from '@/utils/auth'

export type SaveTileGetResponseBody = t.SavedTileRaw

// Get the saved state of a tile
export async function GET(req: Request, { params }: { params: Promise<{ id: string; tileId: string }> }): Promise<Response> {
  const { id, tileId } = await params
  const authUserId = await getAuthenticatedUserId()
  if (!authUserId || authUserId !== id) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const savedTile = await TileModel.getSavedStateRaw(tileId, id)
  console.log('savedState', savedTile)
  return Response.json(savedTile)
}

export type SaveTilePostRequestBody = t.SetSavedTileRaw
export type SaveTilePostResponseBody = t.SavedTileRaw

// Save/unsave a tile
export async function POST(req: Request, { params }: { params: Promise<{ id: string; tileId: string }> }): Promise<Response> {
  const { id, tileId } = await params
  const body = (await req.json()) as SaveTilePostRequestBody

  const authUserId = await getAuthenticatedUserId()
  if (!authUserId || authUserId !== id) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const savedTile = await TileModel.updateSaveStateRaw({ tileId, userId: authUserId, isSaved: body.isSaved ?? true })

  return Response.json(savedTile)
}
