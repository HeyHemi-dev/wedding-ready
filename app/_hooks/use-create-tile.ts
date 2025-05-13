import * as React from 'react'

import { toast } from 'sonner'

import { tileNewRequestBody, tileNewResponseBody } from '@/app/api/tiles/route'
import type * as t from '@/models/types'
import { tryCatchFetch } from '@/utils/try-catch'
import { useUploadThing } from '@/utils/uploadthing'


type CreateTileStatus = 'idle' | 'creating' | 'uploading' | 'complete' | 'error'

/**
 * Creates a tile in the database, and then uploads the image to UploadThing
 * Updating the tile with the image url is handled in the Uploadthing Endpoint
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
    tileData: t.InsertTileRaw
    suppliers: t.SupplierRaw[]
    user: t.User
  }): Promise<void> {
    setStatus('creating')

    const reqBody: tileNewRequestBody = {
      ...tileData,
      suppliers: suppliers,
    }

    // Create the tile in the database
    const { data: tile, error } = await tryCatchFetch<tileNewResponseBody>('/api/tiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    })

    if (error) {
      setStatus('error')
      toast.error(error?.message || 'Failed to create tile')
      return
    }

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
