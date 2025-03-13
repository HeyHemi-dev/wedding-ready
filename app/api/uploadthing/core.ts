import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { getCurrentUser } from '@/actions/get-current-user'
import { TileModel } from '@/models/tile'
import { tileUploaderInputSchema } from '@/models/validations'
import { z } from 'zod'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const uploadthingRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  tileUploader: f({
    'image/jpeg': {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: '1MB',
      maxFileCount: 10,
    },
  })
    .input(tileUploaderInputSchema)
    // Middleware runs on the server before upload
    // Whatever is returned is accessible in onUploadComplete as `metadata`
    .middleware(async ({ req, input }) => {
      const user = await getCurrentUser()
      if (!user) throw new UploadThingError('Unauthorized')

      // Validate input type
      const validatedInput = tileUploaderInputSchema.parse(input)
      return {
        userId: user.id,
        tiles: validatedInput,
      }
    })
    // OnUploadComplete runs on the server after upload
    // Whatever is returned is sent to the clientside `onClientUploadComplete` callback
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Uploaded by:', metadata.userId)
      console.log('File url:', file.ufsUrl)

      const tiles = metadata.tiles.map(async (t) => {
        const tile = await TileModel.getById(t.tileId)
        if (!tile) throw new Error('Tile not found')

        const updatedTile = await TileModel.update({
          id: tile.id,
          createdByUserId: tile.createdByUserId,
          title: t.title || tile.title,
          imagePath: file.ufsUrl,
          description: t.description || tile.description || null,
        })
      })

      return tiles
    }),
} satisfies FileRouter

export type UploadthingRouter = typeof uploadthingRouter
