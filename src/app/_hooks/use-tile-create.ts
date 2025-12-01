'use client'

import * as React from 'react'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { TILE_ERROR_MESSAGE } from '@/app/_types/errors'
import { useUploadThing } from '@/utils/uploadthing'

import { useUploadContext } from '../suppliers/[handle]/new/upload-context'

export const TILE_STATUS = {
  IDLE: 'Ready',
  CREATING: 'Creating tile',
  UPLOADING: 'Uploading image',
  COMPLETE: 'Tile created',
  ERROR: 'Tile creation failed',
} as const

export type TileStatus = (typeof TILE_STATUS)[keyof typeof TILE_STATUS]

/**
 * Creates a tile in the database, and then uploads the image to UploadThing
 * Updating the tile with the image url is handled in the Uploadthing Endpoint
 */
export function useTileCreate(options: { signal?: AbortSignal; uploadId: string }) {
  const { removeFile } = useUploadContext()
  const router = useRouter()
  const [status, setStatus] = React.useState<TileStatus>(TILE_STATUS.IDLE)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const { startUpload } = useUploadThing('tileUploader', {
    headers: {},
    signal: options.signal,
    onUploadBegin: () => {
      setStatus(TILE_STATUS.CREATING)
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress)
    },
    onClientUploadComplete: (res) => {
      setStatus(TILE_STATUS.COMPLETE)
      // Remove the file from the upload context before toast so that handleBeforeUnload isn't called if there are no more tiles to upload.
      removeFile(options.uploadId)

      const tileId = res[0].serverData.id
      toast.success('Tile uploaded', {
        action: {
          label: 'View tile',
          onClick: () => router.push(`/t/${tileId}`),
        },
      })
    },
    onUploadError: (error: Error) => {
      setStatus(TILE_STATUS.ERROR)
      // Use the error message directly from the server, or fallback to generic message
      const errorMessage = error.message || TILE_ERROR_MESSAGE.CREATE_FAILED
      toast.error(errorMessage)
    },
  })

  return {
    startUpload,
    status,
    uploadProgress,
  }
}
