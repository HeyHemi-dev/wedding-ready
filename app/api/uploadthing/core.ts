import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { getCurrentUser } from '@/actions/get-current-user'
import { TileModel } from '@/models/tile'

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
    // Middleware runs on the server before upload
    // Whatever is returned is accessible in onUploadComplete as `metadata`
    .middleware(async ({ req }) => {
      // eslint-disable-line @typescript-eslint/no-unused-vars

      const user = await getCurrentUser()
      if (!user) throw new UploadThingError('Unauthorized')

      return { userId: user.id }
    })
    // OnUploadComplete runs on the server after upload
    // Whatever is returned is sent to the clientside `onClientUploadComplete` callback
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Uploaded by:', metadata.userId)
      console.log('File url:', file.ufsUrl)

      const tile = await TileModel.createRaw({
        createdByUserId: metadata.userId,
        imagePath: file.ufsUrl,
        title: file.name,
      })

      return { tileId: tile.id, tileImagePath: tile.imagePath, tileTitle: tile.title }
    }),
} satisfies FileRouter

export type UploadthingRouter = typeof uploadthingRouter
