import { SupplierRaw, User } from '@/models/types'
import { FileWithMetadata } from './upload-dropzone'
import { UploadPreviewForm } from './upload-preview-form'
import { Separator } from '@/components/ui/separator'
import React from 'react'

export function UploadPreviewList({
  files,
  supplier,
  user,
  onCompleteAction,
}: {
  files: FileWithMetadata[]
  supplier: SupplierRaw
  user: User
  onCompleteAction: (fileIndex: number) => void
}) {
  return (
    <>
      <Separator />
      <div className="grid grid-cols-1 gap-md">
        {files.map((file, index) => (
          <React.Fragment key={file.fileObjectUrl}>
            <UploadPreviewForm file={file} supplier={supplier} user={user} onCompleteAction={() => onCompleteAction(index)} />
            <Separator />
          </React.Fragment>
        ))}
      </div>
    </>
  )
}
