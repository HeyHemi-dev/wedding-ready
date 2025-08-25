'use client'

import * as React from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Form, useForm } from 'react-hook-form'

import { useCreateTile } from '@/app/_hooks/use-create-tile'
import { TileUploadPreviewForm, tileUploadPreviewFormSchema } from '@/app/_types/validation-schema'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { InsertTileRaw, SupplierRaw, User } from '@/models/types'
import { locationHelpers } from '@/utils/const-helpers'

import { FileWithMetadata } from './upload-dropzone'
import { Supplier } from '@/app/_types/suppliers'

export function UploadPreviewForm({
  file,
  supplier,
  user,
  onCompleteAction,
}: {
  file: FileWithMetadata
  supplier: Supplier
  user: User
  onCompleteAction: () => void
}) {
  const { startCreateTile, status, uploadProgress } = useCreateTile({
    onUploadComplete: onCompleteAction,
  })
  const form = useForm<TileUploadPreviewForm>({
    resolver: zodResolver(tileUploadPreviewFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: null,
      createdByUserId: user.id,
      isPrivate: false,
      suppliers: [
        {
          id: supplier.id,
          service: supplier.services[0],
          serviceDescription: '',
        },
      ],
    },
  })

  async function onSubmit(data: TileUploadPreviewForm) {
    const tileData: InsertTileRaw = {
      title: data.title,
      description: data.description || null,
      location: data.location || null,
      createdByUserId: user.id,
      isPrivate: false,
    }

    await startCreateTile({
      files: [file.file],
      tileData,
      suppliers: [supplier],
      user,
    })
  }

  return (
    <>
      {status === 'idle' ? (
        <div className="grid grid-cols-[1fr_3fr] gap-friend">
          <div className="aspect-square overflow-hidden rounded bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- This is a client-side preview of a local file, so Next.js Image optimization isn't needed */}
            <img src={file.fileObjectUrl} alt={file.file.name} className="h-full w-full object-contain" />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-friend">
              <div className="grid gap-sibling">
                <h3 className="ui-s1">Tile Details</h3>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormFieldItem label="Title">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormFieldItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormFieldItem label="Description">
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                    </FormFieldItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormFieldItem label="Location">
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locationHelpers.toPretty().map((location) => (
                              <SelectItem key={location.value} value={location.value}>
                                {location.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormFieldItem>
                  )}
                />
              </div>
              <div className="grid auto-rows-max gap-sibling">
                <h3 className="ui-s1">Suppliers</h3>

                <Label>Credit suppliers</Label>
              </div>
              <div className="col-span-full">
                <SubmitButton pendingChildren={'Please wait'}>Upload</SubmitButton>
              </div>
            </form>
          </Form>
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
