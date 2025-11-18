'use client'

import { useUploadContext } from './upload-context'
import { UploadPreviewList } from './upload-preview'
import { UploadDropzone } from './upload-dropzone'

export function UploadLayout() {
  const { files } = useUploadContext()

  return <>{files.length > 0 ? <UploadPreviewList /> : <UploadDropzone />}</>
}
