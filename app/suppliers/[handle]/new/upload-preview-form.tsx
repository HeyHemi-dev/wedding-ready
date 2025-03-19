'use client'

import * as React from 'react'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { InsertTileRaw, SupplierRaw, User } from '@/models/types'
import { Location } from '@/models/constants'
import { enumToPretty } from '@/utils/enum-to-pretty'
import { SubmitButton } from '@/components/submit-button'
import { useCreateTile } from '@/hooks/use-create-tile'
import { FileWithMetadata } from './upload-dropzone'
import { Progress } from '@/components/ui/progress'

export function UploadPreviewForm({
  file,
  supplier,
  user,
  onCompleteAction,
}: {
  file: FileWithMetadata
  supplier: SupplierRaw
  user: User
  onCompleteAction: () => void
}) {
  const { startCreateTile, status, uploadProgress } = useCreateTile({ onUploadComplete: onCompleteAction })

  async function onSubmit(formData: FormData) {
    const tileData: InsertTileRaw = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      location: (formData.get('location') as Location) || null,
      createdByUserId: user.id,
      isPrivate: false,
    }

    await startCreateTile({ files: [file.file], tileData, suppliers: [supplier], user })
  }

  return (
    <>
      {status === 'idle' ? (
        <div className="grid grid-cols-[1fr_3fr] gap-6">
          <div className="aspect-square overflow-hidden bg-muted rounded-lg">
            <img src={file.fileObjectUrl} alt={file.file.name} className="object-contain w-full h-full" />
          </div>

          <form action={onSubmit} className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <h3 className="font-semibold">Tile Details</h3>
              <div className="space-y-xxs">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={file.file.name} />
              </div>
              <div className="space-y-xxs">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="space-y-xxs">
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
            </div>
            <div className="flex flex-col gap-xs">
              <h3 className="font-semibold">Suppliers</h3>
              <div className="space-y-xxs">
                <Label>Credit suppliers</Label>
              </div>
            </div>
            <div className="col-span-full">
              <SubmitButton pendingChildren={'Please wait'}>Upload</SubmitButton>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex flex-col gap-xs">
          <p>{status}</p>
          <Progress value={uploadProgress} />
        </div>
      )}
    </>
  )
}
