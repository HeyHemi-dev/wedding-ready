import React from 'react'

import { Supplier } from '@/app/_types/suppliers'
import { Area } from '@/components/ui/area'
import { Separator } from '@/components/ui/separator'

import { UploadItem } from './upload-context'
import { UploadPreviewForm } from './upload-preview-form'

export function UploadPreviewList({ files, supplier, userId }: { files: UploadItem[]; supplier: Supplier; userId: string }) {
  return (
    <>
      <Separator />
      <div className="grid grid-cols-1 gap-acquaintance">
        {files.map((file, index) => (
          <React.Fragment key={file.fileObjectUrl}>
            <Area>
              <UploadPreviewForm file={file} supplier={supplier} userId={userId} fileIndex={index} />
            </Area>
          </React.Fragment>
        ))}
      </div>
    </>
  )
}
