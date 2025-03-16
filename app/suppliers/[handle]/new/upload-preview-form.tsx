'use client'

import * as React from 'react'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { InsertTileRaw, Supplier, UserWithDetail } from '@/models/types'
import { Location } from '@/models/constants'
import { enumToPretty } from '@/utils/enum-to-pretty'
import { SubmitButton } from '@/components/submit-button'
import { useCreateTile, useUploadTile } from '@/hooks/use-create-tile'
import { FileWithMetadata } from './upload-dropzone'

export function UploadPreviewForm({
  file,
  supplier,
  user,
  onCompleteAction,
}: {
  file: FileWithMetadata
  supplier: Supplier
  user: UserWithDetail
  onCompleteAction: () => void
}) {
  const { startUpload, isUploading, isUploadComplete } = useUploadTile({ onUploadComplete: onCompleteAction })

  async function onSubmit(formData: FormData) {
    const tileData: InsertTileRaw = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      location: (formData.get('location') as Location) || null,
      createdByUserId: user.id,
      isPrivate: false,
    }

    const tile = await useCreateTile(tileData, [supplier])

    // Upload to UploadThing. onUploadComplete updates the tile with the imagePath
    await startUpload([file.file], { createdByUserId: user.id, tileId: tile.id })
  }

  return (
    <form action={onSubmit} className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">Tile Details</h3>
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={file.file.name} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} />
        </div>
        <div className="space-y-1">
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
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">Suppliers</h3>
        <div className="space-y-1">
          <Label>Credit suppliers</Label>
        </div>
      </div>
      <div className="col-span-full">
        <SubmitButton pendingChildren={'Please wait'}>Upload</SubmitButton>
      </div>
    </form>
  )
}
