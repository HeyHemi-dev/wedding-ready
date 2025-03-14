import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { getCurrentUser } from '@/actions/get-current-user'
import { tiles } from '@/db/schema'
import { TileModel } from '@/models/tile'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const uploadthingRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  tileUploader: f({
    'image/jpeg': {
      maxFileSize: '1MB',
      maxFileCount: 10,
    },
  })
    // Middleware runs on the server before upload
    // Whatever is returned is accessible in onUploadComplete as `metadata`
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .middleware(async ({ req }) => {
      const user = await getCurrentUser()
      if (!user) throw new UploadThingError('Unauthorized')
      return {
        userId: user.id,
      }
    })
    // OnUploadComplete runs on the server after upload
    // Whatever is returned is sent to the clientside `onClientUploadComplete` callback
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Uploaded by:', metadata.userId)
      console.log('File url:', file.ufsUrl)

      // TODO: figure out a way to get the tile id through metadata
      // const tile = await TileModel.getById(t.tileId)
      // if (!tile) throw new Error('Tile not found')

      // await TileModel.update({
      //   ...tile,
      //   imagePath: file.ufsUrl,
      // })

      return
    }),
} satisfies FileRouter

export type UploadthingRouter = typeof uploadthingRouter
