'use client'

import * as React from 'react'

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
export function useCreateTile(options: { signal?: AbortSignal; uploadId: string }) {
  const { removeFile } = useUploadContext()
  const [status, setStatus] = React.useState<TileStatus>(TILE_STATUS.IDLE)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const { startUpload } = useUploadThing('tileUploader', {
    headers: {},
    signal: options.signal,
    onUploadBegin: () => {
      setStatus(TILE_STATUS.CREATING)
    },
    onUploadProgress: (progress) => {
      setStatus(TILE_STATUS.UPLOADING)
      setUploadProgress(progress)
    },
    onClientUploadComplete: () => {
      setStatus(TILE_STATUS.COMPLETE)
      toast('Tile uploaded')
      removeFile(options.uploadId)
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
