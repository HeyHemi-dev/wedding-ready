import type * as types from '@/models/types'
import { useUploadThing } from '@/utils/uploadthing'
import { toast } from 'sonner'
import * as React from 'react'
import { tileNewRequestBody, tileNewResponseBody } from '@/app/api/tiles/route'

type CreateTileStatus = 'idle' | 'creating' | 'uploading' | 'complete' | 'error'

/**
 * Creates a tile in the database, and then uploads the image to UploadThing
 */
export function useCreateTile(options: { signal?: AbortSignal; onUploadComplete?: () => void }) {
  const [status, setStatus] = React.useState<CreateTileStatus>('idle')
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const { startUpload, routeConfig } = useUploadThing('tileUploader', {
    headers: {},
    signal: options.signal,
    onUploadBegin: () => {
      setStatus('uploading')
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress)
    },
    onClientUploadComplete: () => {
      setStatus('complete')
      toast('Tile uploaded')
      options.onUploadComplete?.()
    },
    onUploadError: () => {
      setStatus('error')
      toast.error('Tile upload failed')
    },
  })

  async function startCreateTile({
    files,
    tileData,
    suppliers,
    user,
  }: {
    files: File[]
    tileData: types.InsertTileRaw
    suppliers: types.SupplierRaw[]
    user: types.User
  }): Promise<void> {
    setStatus('creating')

    const reqBody: tileNewRequestBody = {
      ...tileData,
      suppliers: suppliers,
    }

    // Create the tile in the database
    const res = await fetch('/api/tiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    })

    if (!res.ok) {
      setStatus('error')
      toast.error('Failed to create tile')
      return
    }

    const tile = (await res.json()) as tileNewResponseBody

    // Upload the file with some metadata so we can authorize the upload
    await startUpload(files, {
      createdByUserId: user.id,
      tileId: tile.id,
    })
  }

  return {
    startCreateTile,
    routeConfig,
    status,
    uploadProgress,
  }
}
