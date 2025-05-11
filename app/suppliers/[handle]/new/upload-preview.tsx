import React from 'react'

import { Separator } from '@/components/ui/separator'
import { SupplierRaw, User } from '@/models/types'

import { FileWithMetadata } from './upload-dropzone'
import { UploadPreviewForm } from './upload-preview-form'
import { Area } from '@/components/ui/area'

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
      <div className="grid grid-cols-1 gap-acquaintance">
        {files.map((file, index) => (
          <React.Fragment key={file.fileObjectUrl}>
            <Area>
              <UploadPreviewForm file={file} supplier={supplier} user={user} onCompleteAction={() => onCompleteAction(index)} />
            </Area>
          </React.Fragment>
        ))}
      </div>
    </>
  )
}
