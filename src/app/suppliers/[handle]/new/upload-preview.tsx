import React from 'react'

import { ErrorBoundary } from 'react-error-boundary'

import { useCreateTile } from '@/app/_hooks/use-create-tile'
import { Area } from '@/components/ui/area'
import { Progress } from '@/components/ui/progress'

import { UploadItem, useUploadContext } from './upload-context'
import { UploadPreviewForm } from './upload-preview-form'
import { TileUploadPreviewForm } from '@/app/_types/validation-schema'

export function UploadPreviewList() {
  const { files } = useUploadContext()

  return (
    <div className="grid grid-cols-1 gap-acquaintance">
      {files.map((file) => (
        <React.Fragment key={file.uploadId}>
          <ErrorBoundary fallback={<div>Error creating tile</div>}>
            <UploadPreviewItem file={file} />
          </ErrorBoundary>
        </React.Fragment>
      ))}
    </div>
  )
}

function UploadPreviewItem({ file }: { file: UploadItem }) {
  const { removeFile } = useUploadContext()
  const { startUpload, status, uploadProgress } = useCreateTile({
    uploadId: file.uploadId,
  })

  async function handleUpload(data: TileUploadPreviewForm) {
    // startUpload catches and handles errors
    startUpload([file.file], data)
  }

  function handleDelete() {
    removeFile(file.uploadId)
  }

  return (
    <>
      {status === 'idle' ? (
        <div className="grid grid-cols-3 gap-area">
          <Area className="relative overflow-clip rounded-area">
            {/* eslint-disable-next-line @next/next/no-img-element -- This is a client-side preview of a local file, so Next.js Image optimization isn't needed */}
            <img src={file.fileObjectUrl} alt={file.file.name} className="absolute inset-0 h-full w-full object-contain" />
          </Area>

          <Area className="col-span-2">
            <UploadPreviewForm onSubmit={handleUpload} onDelete={handleDelete} />
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
