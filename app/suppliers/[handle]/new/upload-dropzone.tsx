'use client'

import * as React from 'react'
import { generateClientDropzoneAccept, generatePermittedFileTypes, isValidFileSize } from 'uploadthing/client'
import { useUploadThing, useDropzone } from '@/utils/uploadthing'
import { Button } from '@/components/ui/button'
import { SupplierRaw, User } from '@/models/types'
import { ExpandedRouteConfig } from 'uploadthing/types'
import { UploadPreviewList } from './upload-preview'
import { toast } from 'sonner'

export type FileWithMetadata = {
  file: File
  fileObjectUrl: string
}

export function UploadDropzone({ supplier, user }: { supplier: SupplierRaw; user: User }) {
  const [files, setFiles] = React.useState<FileWithMetadata[]>([])
  const { routeConfig } = useUploadThing('tileUploader')

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      if (!checkFileSizes(acceptedFiles, routeConfig)) {
        toast.error('File size is too large')
        return
      }

      const files = acceptedFiles.map((file) => ({
        file,
        fileObjectUrl: URL.createObjectURL(file),
      }))
      setFiles(() => [...files])
    },
    [routeConfig]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(generatePermittedFileTypes(routeConfig).fileTypes),
  })

  React.useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.fileObjectUrl))
  }, [files])

  return (
    <>
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
    </>
  )
}

function Dropzone({
  getRootProps,
  getInputProps,
}: {
  getRootProps: ReturnType<typeof useDropzone>['getRootProps']
  getInputProps: ReturnType<typeof useDropzone>['getInputProps']
}) {
  return (
    <div
      {...getRootProps()}
      className="flex flex-col justify-center items-center gap-md border-2 border-dashed rounded-lg p-16 min-h-[25svh] hover:bg-muted/50 cursor-pointer">
      <input {...getInputProps()} />
      <div className="text-center">
        <p className="">Drag and drop images here</p>
        <p className="text-sm text-muted-foreground">Images must be jpg/jpeg format, and less than 1 MB</p>
      </div>
      <Button variant={'secondary'}>Choose images</Button>
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
