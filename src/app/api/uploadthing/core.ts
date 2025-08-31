import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'

import { tileUploaderInputSchema, tileUploadPreviewFormSchema } from '@/app/_types/validation-schema'
import { tileModel } from '@/models/tile'
import { getAuthUserId } from '@/utils/auth'
import { OPERATION_ERROR, ROUTE_ERROR } from '@/app/_types/errors'
import { supplierModel } from '@/models/supplier'
import { tileOperations } from '@/operations/tile-operations'

const f = createUploadthing()

export const uploadthingRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  tileUploader: f({
    'image/jpeg': {
      maxFileSize: '1MB',
      maxFileCount: 1,
    },
  })
    .input(tileUploadPreviewFormSchema)
    // Middleware runs on the server before upload
    // Whatever is returned is accessible in onUploadComplete as `metadata`
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .middleware(async ({ req, input }) => {
      const { data: validatedInput, error: inputError } = tileUploadPreviewFormSchema.safeParse(input)
      if (inputError || input.isPrivate === true) {
        throw OPERATION_ERROR.BAD_REQUEST()
      }

      const authUserId = await getAuthUserId()
      if (!authUserId || authUserId !== input.createdByUserId) {
        throw OPERATION_ERROR.UNAUTHORIZED()
      }

      for (const credit of input.credits) {
        const supplier = await supplierModel.getRawById(credit.supplier.id)
        if (!supplier) {
          throw OPERATION_ERROR.DATA_INTEGRITY()
        }
      }

      return validatedInput
    })

    // OnUploadComplete runs on the server after upload
    // Whatever is returned is sent to the clientside `onClientUploadComplete` callback
    .onUploadComplete(async ({ metadata, file }) => {
      return tileOperations.createForSupplier({
        imagePath: file.ufsUrl,
        title: metadata.title,
        description: metadata.description,
        location: metadata.location,
        createdByUserId: metadata.createdByUserId,
        isPrivate: metadata.isPrivate,
        credits: metadata.credits,
      })
    }),
} satisfies FileRouter

export type UploadthingRouter = typeof uploadthingRouter
