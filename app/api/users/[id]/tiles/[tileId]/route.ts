import { TileModel } from '@/models/tile'
import * as t from '@/models/types'
import { getAuthenticatedUserId } from '@/utils/auth'

export type SaveTileRequestBody = t.SetSavedTileRaw
export type SaveTileResponseBody = t.SavedTileRaw

// Save/unsave a tile
export async function POST(req: Request, { params }: { params: Promise<{ id: string; tileId: string }> }): Promise<Response> {
  const { id, tileId } = await params
  const body = (await req.json()) as SaveTileRequestBody

  const authUserId = await getAuthenticatedUserId()
  if (!authUserId || authUserId !== id) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const savedTile = await TileModel.saveTile({ tileId, userId: authUserId, isSaved: body.isSaved ?? true })
  // Revalidate useQuery for tiles

  return Response.json(savedTile)
}
