'use client'

import * as React from 'react'

import { Supplier } from '@/app/_types/suppliers'

import { useUploadContext } from './upload-context'
import { UploadPreviewList } from './upload-preview'
import { UploadDropzone } from './upload-dropzone'

export function UploadLayout({ supplier, userId }: { supplier: Supplier; userId: string }) {
  const { files } = useUploadContext()

  return <>{files.length > 0 ? <UploadPreviewList files={files} supplier={supplier} userId={userId} /> : <UploadDropzone />}</>
}
