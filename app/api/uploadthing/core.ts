import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { getCurrentUser } from '@/actions/get-current-user'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const uploadthingRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  tileUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: '1MB',
      maxFileCount: 10,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      const body = await req.json()
      const { supplierId } = body

      // Authenticate before upload
      const user = await getCurrentUser()

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError('Unauthorized')

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Upload complete for userId:', metadata.userId)

      console.log('file url', file.url)

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type UploadthingRouter = typeof uploadthingRouter
