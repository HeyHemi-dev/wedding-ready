'use client'

import * as React from 'react'
import { useFormStatus } from 'react-dom'
import { generateClientDropzoneAccept, generatePermittedFileTypes } from 'uploadthing/client'
import { useUploadThing, useDropzone } from '@/utils/uploadthing'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Supplier, TileRaw, UserWithDetail } from '@/models/types'
import { tileNewRequestBody, tileNewResponseBody, tilesUpdateRequestBody } from '@/app/api/tiles/route'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { enumToPretty } from '@/utils/enum-to-pretty'
import { Location } from '@/models/constants'

interface FileWithMetaData extends TileRaw {
  preview: string
  file: File
}

function UploadButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} variant={'default'}>
      {pending ? 'Uploading...' : 'Upload files'}
    </Button>
  )
}

export function CustomUploadForm({ supplier, user }: { supplier: Supplier; user: UserWithDetail }) {
  const [files, setFiles] = React.useState<FileWithMetaData[]>([])
  const filesRef = React.useRef<FileWithMetaData[]>([])
  const formRef = React.useRef<HTMLFormElement>(null)
  const router = useRouter()

  React.useEffect(() => {
    filesRef.current = files
  }, [files])

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const filesWithMetadata = await Promise.all(
        acceptedFiles.map(async (file) => {
          const reqBody: tileNewRequestBody = {
            title: file.name,
            createdByUserId: user.id,
            suppliers: [supplier],
          }
          // Create a tile for each file
          const res = await fetch('/api/tiles/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody),
          })
          const resBody = (await res.json()) as tileNewResponseBody

          return Object.assign(file, {
            preview: URL.createObjectURL(file),
            file: file,
            ...resBody,
          })
        })
      )
      setFiles(filesWithMetadata)
    },
    [supplier, user.id]
  )

  const { startUpload, routeConfig } = useUploadThing('tileUploader', {
    onClientUploadComplete: () => {
      alert('uploaded successfully!')
      setFiles([])
      router.push(`/suppliers/${supplier.handle}`)
    },
    onUploadError: () => {
      alert('error occurred while uploading')
    },
    onUploadBegin: (filename) => {
      console.log('upload has begun for', filename)
    },
  })

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(generatePermittedFileTypes(routeConfig).fileTypes),
  })

  React.useEffect(() => {
    return () =>
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
  }, [files])

  // TODO: look into using pica to resize images before uploading
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const filesCurrent = filesRef.current
    const reqBody: tilesUpdateRequestBody = {
      tiles: filesCurrent.map((file) => ({
        id: file.id!,
        title: file.title!,
        description: file.description ?? null,
        location: file.location ?? null,
        isPrivate: file.isPrivate ?? false,
        createdByUserId: user.id,
        createdAt: file.createdAt!,
        updatedAt: new Date(),
        imagePath: null,
      })),
    }

    console.log('Request body for update:', reqBody)

    await fetch('/api/tiles/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    })

    // Use the original files for upload
    const filesToUpload = filesCurrent.map((file) => file.file)

    startUpload(filesToUpload, { tileId: '' })
  }

  const updateFileMetadata = (index: number, metadata: Partial<FileWithMetaData>) => {
    setFiles((prev) => {
      const updated = prev.map((file, i) => (i === index ? { ...file, ...metadata } : file))
      console.log('Updated file metadata:', updated[index])
      return updated
    })
  }

  return (
    <div className="space-y-4">
      {files.length === 0 && (
        <div
          {...getRootProps()}
          className="flex flex-col items-center justify-center gap-4 border rounded-md p-12 min-h-[25svh] hover:bg-gray-50 cursor-pointer">
          <input {...getInputProps()} />

          <Button variant={'default'}>Click to add images</Button>
          <p className="text-center text-gray-600">Or drag and drop up to {routeConfig?.['image/jpeg']?.maxFileCount} images</p>
        </div>
      )}

      {files.length > 0 && (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <FilePreviewList files={files} onUpdateMetadata={updateFileMetadata} />
          <UploadButton />
        </form>
      )}
    </div>
  )
}

function FilePreviewList({
  files,
  onUpdateMetadata,
}: {
  files: FileWithMetaData[]
  onUpdateMetadata: (index: number, metadata: Partial<FileWithMetaData>) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file, index) => (
        <FilePreview key={file.id} file={file} onUpdateMetadata={(metadata) => onUpdateMetadata(index, metadata)} />
      ))}
    </div>
  )
}

// TODO suggest having one form per image, so a user can submit/update/upload each image one at a time as they fill out the forms.
// The handle submit will then only process one image at a time making it easier to pass the tileId as an input on the startUpload function.
// TODO: Use zod to validate the form data
function FilePreview({ file, onUpdateMetadata }: { file: FileWithMetaData; onUpdateMetadata: (metadata: Partial<FileWithMetaData>) => void }) {
  return (
    <div className="space-y-2">
      <div className="relative aspect-square">
        <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover rounded-lg" />
      </div>
      <div className="space-y-2">
        <Input
          type="text"
          name={`title-${file.id}`}
          value={file.title}
          onChange={(e) => onUpdateMetadata({ title: e.target.value })}
          className="w-full px-2 py-1 border rounded"
          placeholder="Title"
        />
        <Textarea
          name={`description-${file.id}`}
          value={file.description ?? ''}
          onChange={(e) => onUpdateMetadata({ description: e.target.value })}
          className="w-full px-2 py-1 border rounded"
          placeholder="Description"
          rows={2}
        />
        <Select name={`location-${file.id}`} value={file.location ?? ''} onValueChange={(value) => onUpdateMetadata({ location: value as Location })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            {enumToPretty(Location).map((location) => (
              <SelectItem key={location.value} value={location.value}>
                {location.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
