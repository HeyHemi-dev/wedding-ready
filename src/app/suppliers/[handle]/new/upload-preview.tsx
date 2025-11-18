import React from 'react'

import { Area } from '@/components/ui/area'
import { Separator } from '@/components/ui/separator'

import { useUploadContext } from './upload-context'
import { UploadPreviewForm } from './upload-preview-form'

export function UploadPreviewList() {
  const { files } = useUploadContext()

  return (
    <>
      <Separator />
      <div className="grid grid-cols-1 gap-acquaintance">
        {files.map((file) => (
          <React.Fragment key={file.uploadId}>
            <Area>
              <UploadPreviewForm file={file} />
            </Area>
          </React.Fragment>
        ))}
      </div>
    </>
  )
}
