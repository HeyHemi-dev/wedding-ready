'use client'

import * as React from 'react'
import { generateClientDropzoneAccept, generatePermittedFileTypes } from 'uploadthing/client'
import { useUploadThing, useDropzone } from '@/utils/uploadthing'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Supplier, UserWithDetail } from '@/models/types'
import { tileNewRequestBody, tileNewResponseBody } from '@/app/api/tile/new/route'
import { Button } from '@/components/ui/button'
interface FileWithMetaData extends File {
  preview?: string
  tileId?: string
  title?: string
  description?: string
  location?: string
  isPrivate?: boolean
  suppliers?: Supplier[]
}

export function CustomUploadForm({ supplier, user }: { supplier: Supplier; user: UserWithDetail }) {
  const [files, setFiles] = React.useState<FileWithMetaData[]>([])

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const filesWithMetadata = await Promise.all(
      acceptedFiles.map(async (file) => {
        const reqBody: tileNewRequestBody = {
          title: file.name,
          createdByUserId: user.id,
          suppliers: [supplier],
        }
        // Create a tile for each file
        const res = await fetch('/api/tile/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reqBody),
        })
        const resBody = (await res.json()) as tileNewResponseBody

        return Object.assign(file, {
          preview: URL.createObjectURL(file),
          tileId: resBody.id,
          title: resBody.title,
          location: undefined,
          isPrivate: false,
          suppliers: resBody.suppliers,
        })
      })
    )
    setFiles(filesWithMetadata)
  }, [])

  const { startUpload, routeConfig } = useUploadThing('tileUploader', {
    onClientUploadComplete: () => {
      alert('uploaded successfully!')
      setFiles([])
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

  // Cleanup previews
  React.useEffect(() => {
    return () =>
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
  }, [files])

  const handleUpload = () => {
    startUpload(
      files,
      files.map((file) => ({
        tileId: file.tileId!,
        title: file.title!,
        description: file.description,
        location: file.location,
        isPrivate: file.isPrivate,
        suppliers: file.suppliers!,
      }))
    )
  }

  const updateFileMetadata = (index: number, metadata: Partial<FileWithMetaData>) => {
    setFiles((prev) => prev.map((file, i) => (i === index ? { ...file, ...metadata } : file)))
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
        <div>
          <button onClick={handleUpload} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Upload {files.length} files
          </button>

          <FilePreviewList files={files} onUpdateMetadata={updateFileMetadata} />
        </div>
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
        <FilePreview key={file.name} file={file} onUpdateMetadata={(metadata) => onUpdateMetadata(index, metadata)} />
      ))}
    </div>
  )
}

function FilePreview({ file, onUpdateMetadata }: { file: FileWithMetaData; onUpdateMetadata: (metadata: Partial<FileWithMetaData>) => void }) {
  return (
    <div className="space-y-2">
      <div className="relative aspect-square">
        <img src={file.preview} alt={file.name} className="w-full h-full object-cover rounded-lg" />
      </div>
      <div className="space-y-2">
        <Input
          type="text"
          value={file.title}
          onChange={(e) => onUpdateMetadata({ title: e.target.value })}
          className="w-full px-2 py-1 border rounded"
          placeholder="Title"
        />
        <Textarea
          value={file.description}
          onChange={(e) => onUpdateMetadata({ description: e.target.value })}
          className="w-full px-2 py-1 border rounded"
          placeholder="Description"
          rows={2}
        />
      </div>
    </div>
  )
}
