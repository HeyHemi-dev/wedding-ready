'use client'

import * as React from 'react'

import { toast } from 'sonner'
import { generateClientDropzoneAccept, generatePermittedFileTypes, isValidFileSize } from 'uploadthing/client'
import { ExpandedRouteConfig } from 'uploadthing/types'

import { Supplier } from '@/app/_types/suppliers'
import { Button } from '@/components/ui/button'
import { User } from '@/models/types'
import { useUploadThing, useDropzone } from '@/utils/uploadthing'

import { useUploadContext } from './upload-context'
import { UploadPreviewList } from './upload-preview'

export function UploadDropzone({ supplier, user }: { supplier: Supplier; user: User }) {
  const { files, addFiles } = useUploadContext()
  const { routeConfig } = useUploadThing('tileUploader')

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      if (!checkFileSizes(acceptedFiles, routeConfig)) {
        toast.error('File size is too large')
        return
      }
      addFiles(acceptedFiles)
    },
    [routeConfig, addFiles]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(generatePermittedFileTypes(routeConfig).fileTypes),
  })

  return (
    <>
      {files.length === 0 && <Dropzone getRootProps={getRootProps} getInputProps={getInputProps} />}

      {files.length > 0 && <UploadPreviewList files={files} supplier={supplier} user={user} />}
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
      className="flex min-h-[25svh] cursor-pointer flex-col items-center justify-center gap-md rounded-area border-2 border-dashed border-secondary p-16 hover:bg-secondary/50">
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
