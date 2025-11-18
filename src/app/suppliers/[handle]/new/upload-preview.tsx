import React from 'react'

import { Area } from '@/components/ui/area'
import { Separator } from '@/components/ui/separator'

import { UploadItem, useUploadContext } from './upload-context'
import { UploadPreviewForm } from './upload-preview-form'
import { useCreateTile } from '@/app/_hooks/use-create-tile'
import { Progress } from '@/components/ui/progress'

export function UploadPreviewList() {
  const { files } = useUploadContext()

  return (
    <>
      <Separator />
      <div className="grid grid-cols-1 gap-acquaintance">
        {files.map((file) => (
          <UploadPreviewItem file={file} key={file.uploadId} />
        ))}
      </div>
    </>
  )
}

function UploadPreviewItem({ file }: { file: UploadItem }) {
  const { startUpload, status, uploadProgress } = useCreateTile({
    uploadId: file.uploadId,
  })

  return (
    <>
      {status === 'idle' ? (
        <div className="grid grid-cols-3 gap-area">
          <Area className="aspect-square overflow-hidden rounded bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- This is a client-side preview of a local file, so Next.js Image optimization isn't needed */}
            <img src={file.fileObjectUrl} alt={file.file.name} className="h-full w-full object-contain" />
          </Area>
          <Area className="col-span-2">
            <UploadPreviewForm file={file} startUpload={startUpload} />
          </Area>
        </div>
      ) : (
        <div className="flex flex-col gap-spouse">
          <p>{status}</p>
          <Progress value={uploadProgress} />
        </div>
      )}
    </>
  )
}
