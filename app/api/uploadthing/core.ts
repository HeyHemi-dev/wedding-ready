import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'

import { tileUploaderInputSchema } from '@/app/_types/validation-schema'
import { TileModel } from '@/models/tile'
import { getAuthenticatedUserId } from '@/utils/auth'

const f = createUploadthing()

export const uploadthingRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  tileUploader: f({
    'image/jpeg': {
      maxFileSize: '1MB',
      maxFileCount: 1,
    },
  })
    .input(tileUploaderInputSchema)
    // Middleware runs on the server before upload
    // Whatever is returned is accessible in onUploadComplete as `metadata`
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .middleware(async ({ req, input }) => {
      try {
        const authUserId = await getAuthenticatedUserId()
        if (!authUserId || authUserId !== input.createdByUserId) throw new Error('Unauthorized')

        const validInput = tileUploaderInputSchema.safeParse(input)
        if (!validInput.success) throw new Error('Invalid input')

        const tileRaw = await TileModel.getRawById(validInput.data.tileId)
        if (!tileRaw) throw new Error('Tile not found')

        return {
          tileRaw: tileRaw,
        }
      } catch (error) {
        console.error('Error in upload middleware', error)
        throw new UploadThingError('Error while uploading tile')
      }
    })

    // OnUploadComplete runs on the server after upload
    // Whatever is returned is sent to the clientside `onClientUploadComplete` callback
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        await TileModel.update({
          ...metadata.tileRaw,
          imagePath: file.ufsUrl,
        })

        return
      } catch (error) {
        console.error('Error updating tile', error)
        throw new UploadThingError('Error updating tile')
      }
    }),
} satisfies FileRouter

export type UploadthingRouter = typeof uploadthingRouter
