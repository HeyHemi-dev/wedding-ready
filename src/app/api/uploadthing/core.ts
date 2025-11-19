import { createUploadthing, type FileRouter } from 'uploadthing/next'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { tileUploadSchema } from '@/app/_types/validation-schema'
import { supplierModel } from '@/models/supplier'
import { tileOperations } from '@/operations/tile-operations'
import { getAuthUserId } from '@/utils/auth'

const f = createUploadthing()

export const uploadthingRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  tileUploader: f({
    'image/jpeg': {
      maxFileSize: '1MB',
      maxFileCount: 1,
    },
  })
    .input(tileUploadSchema)
    // Middleware runs on the server before upload
    // Whatever is returned is accessible in onUploadComplete as `metadata`
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .middleware(async ({ req, input }) => {
      const { success, data: validatedInput } = tileUploadSchema.safeParse(input)
      if (!success) throw OPERATION_ERROR.VALIDATION_ERROR()

      if (validatedInput.formData.credits.some((credit) => credit.supplierId !== validatedInput.supplierId)) {
        throw OPERATION_ERROR.BUSINESS_RULE_VIOLATION()
      }

      const authUserId = await getAuthUserId()
      if (!authUserId) throw OPERATION_ERROR.NOT_AUTHENTICATED()
      if (authUserId !== validatedInput.authUserId) throw OPERATION_ERROR.FORBIDDEN()

      validatedInput.formData.credits.map(async (credit) => {
        const supplier = await supplierModel.getRawById(credit.supplierId)
        if (!supplier) throw OPERATION_ERROR.RESOURCE_NOT_FOUND()
      })

      return validatedInput
    })

    // OnUploadComplete runs on the server after upload
    // Whatever is returned is sent to the clientside `onClientUploadComplete` callback
    .onUploadComplete(async ({ metadata, file }) => {
      return tileOperations.createForSupplier({
        imagePath: file.ufsUrl,
        title: metadata.formData.title,
        description: metadata.formData.description,
        location: metadata.formData.location,
        createdByUserId: metadata.authUserId,
        credits: metadata.formData.credits,
      })
    }),
} satisfies FileRouter

export type UploadthingRouter = typeof uploadthingRouter
