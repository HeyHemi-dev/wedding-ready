import { generateUploadButton, generateUploadDropzone, generateReactHelpers, useDropzone } from '@uploadthing/react'

import type { UploadthingRouter } from '@/app/api/uploadthing/core'

export const UploadButton = generateUploadButton<UploadthingRouter>()
export const UploadDropzone = generateUploadDropzone<UploadthingRouter>()
export const { useUploadThing, uploadFiles } = generateReactHelpers<UploadthingRouter>()
export { useDropzone }
