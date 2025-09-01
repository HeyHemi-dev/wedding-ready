import React from 'react'

import { Area } from '@/components/ui/area'
import { Separator } from '@/components/ui/separator'
import { SupplierWithUsers, User } from '@/models/types'

import { FileWithMetadata } from './upload-context'
import { UploadPreviewForm } from './upload-preview-form'
import { Supplier } from '@/app/_types/suppliers'

export function UploadPreviewList({ files, supplier, user }: { files: FileWithMetadata[]; supplier: Supplier; user: User }) {
  return (
    <>
      <Separator />
      <div className="grid grid-cols-1 gap-acquaintance">
        {files.map((file, index) => (
          <React.Fragment key={file.fileObjectUrl}>
            <Area>
              <UploadPreviewForm file={file} supplier={supplier} user={user} fileIndex={index} />
            </Area>
          </React.Fragment>
        ))}
      </div>
    </>
  )
}
