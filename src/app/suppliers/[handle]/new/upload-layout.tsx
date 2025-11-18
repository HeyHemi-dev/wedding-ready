'use client'

import { useUploadContext } from './upload-context'
import { UploadDropzone } from './upload-dropzone'
import { UploadPreviewList } from './upload-preview'

export function UploadLayout() {
  const { files } = useUploadContext()

  return <>{files.length > 0 ? <UploadPreviewList /> : <UploadDropzone />}</>
}
