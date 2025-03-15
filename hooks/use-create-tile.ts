import type * as types from '@/models/types'
import { useUploadThing } from '@/utils/uploadthing'
import { toast } from 'sonner'
import * as React from 'react'
/**
 * Creates a tile in the database and returns the tile
 */
export async function useCreateTile(tileData: types.InsertTileRaw, suppliers: types.Supplier[]): Promise<types.TileRaw> {
  const res = await fetch('/api/tiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...tileData,
      suppliers: suppliers,
    }),
  })

  if (!res.ok) {
    throw new Error('Failed to create tile')
  }

  return (await res.json()) as types.TileRaw
}

export function useUploadTile(signal?: AbortSignal) {
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const { startUpload, isUploading, routeConfig } = useUploadThing('tileUploader', {
    headers: {},
    signal,
    onClientUploadComplete: () => {
      toast('Tile uploaded')
    },
    onUploadError: () => {
      toast.error('Tile upload failed')
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress)
    },
  })

  return {
    startUpload,
    isUploading,
    uploadProgress,
  }
}
