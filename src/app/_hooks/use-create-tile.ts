'use client'

import * as React from 'react'

import { toast } from 'sonner'

import { useUploadThing } from '@/utils/uploadthing'

import { useUploadContext } from '../suppliers/[handle]/new/upload-context'

const CREATE_TILE_STATUS = {
  IDLE: 'idle',
  CREATING: 'creating',
  UPLOADING: 'uploading',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const

type CreateTileStatus = (typeof CREATE_TILE_STATUS)[keyof typeof CREATE_TILE_STATUS]

/**
 * Creates a tile in the database, and then uploads the image to UploadThing
 * Updating the tile with the image url is handled in the Uploadthing Endpoint
 */
export function useCreateTile(options: { signal?: AbortSignal; fileKey: number }) {
  const { removeFile } = useUploadContext()
  const [status, setStatus] = React.useState<CreateTileStatus>(CREATE_TILE_STATUS.IDLE)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const { startUpload, routeConfig } = useUploadThing('tileUploader', {
    headers: {},
    signal: options.signal,
    onUploadBegin: () => {
      setStatus(CREATE_TILE_STATUS.UPLOADING)
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress)
    },
    onClientUploadComplete: () => {
      setStatus(CREATE_TILE_STATUS.COMPLETE)
      toast('Tile uploaded')
      removeFile(options.fileKey)
    },
    onUploadError: () => {
      setStatus(CREATE_TILE_STATUS.ERROR)
      toast.error('Tile upload failed')
    },
  })

  // async function startCreateTile({
  //   files,
  //   tileData,
  //   suppliers,
  //   user,
  // }: {
  //   files: File[]
  //   tileData: t.InsertTileRaw
  //   suppliers: Supplier[]
  //   user: t.User
  // }): Promise<void> {
  //   setStatus(CREATE_TILE_STATUS.CREATING)

  //   const reqBody: tileNewRequestBody = {
  //     ...tileData,
  //     suppliers: suppliers,
  //   }

  //   // Create the tile in the database
  //   const { data: tile, error } = await tryCatchFetch<tileNewResponseBody>('/api/tiles', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(reqBody),
  //   })

  //   if (error) {
  //     setStatus(CREATE_TILE_STATUS.ERROR)
  //     toast.error(error?.message || 'Failed to create tile')
  //     return
  //   }

  //   // Upload the file with some metadata so we can authorize the upload
  //   await startUpload(files, {
  //     createdByUserId: user.id,
  //     tileId: tile.id,
  //   })
  // }

  return {
    startUpload,
    routeConfig,
    status,
    uploadProgress,
  }
}
