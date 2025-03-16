'use client'

import * as React from 'react'
import { generateClientDropzoneAccept, generatePermittedFileTypes, isValidFileSize } from 'uploadthing/client'
import { useUploadThing, useDropzone } from '@/utils/uploadthing'
import { Button } from '@/components/ui/button'
import { Supplier, UserWithDetail } from '@/models/types'
import { ExpandedRouteConfig } from 'uploadthing/types'
import { UploadPreviewList } from './upload-preview'

export type FileWithMetadata = {
  file: File
  fileObjectUrl: string
}

export function UploadDropzone({ supplier, user }: { supplier: Supplier; user: UserWithDetail }) {
  const [files, setFiles] = React.useState<FileWithMetadata[]>([])
  const { routeConfig } = useUploadThing('tileUploader')

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (!checkFileSizes(acceptedFiles, routeConfig)) {
      alert('File size is too large')
      return
    }

    const files = acceptedFiles.map((file) => ({
      file,
      fileObjectUrl: URL.createObjectURL(file),
    }))
    setFiles(() => [...files])
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(generatePermittedFileTypes(routeConfig).fileTypes),
  })

  React.useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.fileObjectUrl))
  }, [files])

  return (
    <div className="space-y-6">
      {files.length === 0 && <Dropzone getRootProps={getRootProps} getInputProps={getInputProps} />}

      {files.length > 0 && (
        <UploadPreviewList
          files={files}
          supplier={supplier}
          user={user}
          onCompleteAction={(fileIndex) => {
            setFiles((prev) => prev.filter((_, i) => i !== fileIndex))
          }}
        />
      )}
    </div>
  )
}

function Dropzone({ getRootProps, getInputProps }: { getRootProps: any; getInputProps: any }) {
  return (
    <div
      {...getRootProps()}
      className="flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-lg p-12 min-h-[25svh] hover:bg-gray-50/50 cursor-pointer">
      <input {...getInputProps()} />
      <div className="text-center">
        <p className="">Drag and drop images here</p>
        <p className="text-sm text-muted-foreground">Must be jpg/jpeg, and less than 1 MB</p>
      </div>
      <Button variant="outline">Choose images</Button>
    </div>
  )
}

function checkFileSizes(files: File[], routeConfig: ExpandedRouteConfig | undefined) {
  for (const file of files) {
    if (routeConfig) {
      return isValidFileSize(file, routeConfig)
    } else {
      return file.size < 1024 * 1024 * 1 // Number of MB
    }
  }
}
