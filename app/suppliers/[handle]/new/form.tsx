'use client'

import * as React from 'react'
import { generateClientDropzoneAccept, generateMimeTypes, generatePermittedFileTypes, isValidFileSize } from 'uploadthing/client'
import { useUploadThing, useDropzone } from '@/utils/uploadthing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { InsertTileRaw, Supplier, TileRaw, UserWithDetail } from '@/models/types'
import { Location } from '@/models/constants'
import { enumToPretty } from '@/utils/enum-to-pretty'
import { SubmitButton } from '@/components/submit-button'
import { ExpandedRouteConfig } from 'uploadthing/types'

type FileWithMetadata = {
  file: File
  fileObjectUrl: string
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

export function CustomUploadForm({ supplier, user }: { supplier: Supplier; user: UserWithDetail }) {
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
      {files.length === 0 && <UploadDropzone getRootProps={getRootProps} getInputProps={getInputProps} />}
      {files.length > 0 && (
        <FilePreviewList
          files={files}
          supplier={supplier}
          user={user}
          onComplete={(fileIndex) => {
            setFiles((prev) => prev.filter((_, i) => i !== fileIndex))
          }}
        />
      )}
    </div>
  )
}

function FilePreviewList({
  files,
  supplier,
  user,
  onComplete,
}: {
  files: FileWithMetadata[]
  supplier: Supplier
  user: UserWithDetail
  onComplete: (fileIndex: number) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {files.map((file, index) => (
        <FilePreview key={file.fileObjectUrl} file={file} supplier={supplier} user={user} onComplete={() => onComplete(index)} />
      ))}
    </div>
  )
}

function FilePreview({ file, supplier, user, onComplete }: { file: FileWithMetadata; supplier: Supplier; user: UserWithDetail; onComplete: () => void }) {
  const { startUpload, isUploading } = useUploadThing('tileUploader', {
    onClientUploadComplete: () => {
      onComplete()
    },
    onUploadError: (error) => {
      console.error('Upload failed:', error)
      // Could add toast notification here
    },
  })

  async function onSubmit(formData: FormData) {
    // Create tile first
    const tileData: InsertTileRaw = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      location: (formData.get('location') as Location) || null,
      createdByUserId: user.id,
      isPrivate: false,
    }
    // Create tile in the database
    const res = await fetch('/api/tiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...tileData,
        suppliers: [supplier],
      }),
    })

    if (!res.ok) {
      throw new Error('Failed to create tile')
    }

    const tile = (await res.json()) as TileRaw

    // Upload to UploadThing. onUploadComplete updates the tile with the imagePath
    await startUpload([file.file], { createdByUserId: user.id, tileId: tile.id })
  }

  return (
    <Card>
      <CardContent className="p-6 flex gap-6">
        <div className="w-1/3">
          <div className="aspect-square relative rounded-lg overflow-hidden">
            <img src={file.fileObjectUrl} alt={file.file.name} className="object-cover w-full h-full" />
          </div>
        </div>

        <form action={onSubmit} className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={file.file.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select name="location">
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

          <SubmitButton>Upload</SubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}

function UploadDropzone({ getRootProps, getInputProps }: { getRootProps: any; getInputProps: any }) {
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
