import * as React from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { TileUploadPreviewForm, tileUploadPreviewFormSchema } from '@/app/_types/validation-schema'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { locationHelpers } from '@/utils/const-helpers'

import { UploadItem, useUploadContext } from './upload-context'
import { Button } from '@/components/ui/button'

const formSteps = ['Add Details', 'Credit Suppliers'] as const

type FormStep = (typeof formSteps)[number]

export function UploadPreviewForm({ file, startUpload }: { file: UploadItem; startUpload: (files: File[], data: TileUploadPreviewForm) => void }) {
  const { supplier, authUserId } = useUploadContext()
  if (!supplier || !authUserId) throw OPERATION_ERROR.INVALID_STATE()

  const form = useForm<TileUploadPreviewForm>({
    resolver: zodResolver(tileUploadPreviewFormSchema),
    defaultValues: {
      title: undefined,
      description: undefined,
      location: undefined,
      createdByUserId: authUserId,
      isPrivate: false,
      credits: [
        {
          supplierId: supplier.id,
          service: supplier.services[0],
          serviceDescription: undefined,
        },
      ],
    },
    mode: 'onBlur',
  })
  const [formStep, setFormStep] = React.useState<FormStep>(formSteps[0])

  async function onSubmit(data: TileUploadPreviewForm) {
    // startUpload catches and handles errors
    startUpload([file.file], data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-rows-[auto_1fr] gap-friend">
        {formStep === formSteps[0] && (
          <div data-test-id={`form-step-1`} className="grid grid-cols-2 gap-sibling">
            <div data-test-id="form-header" className="flex gap-spouse">
              <p className="ui text-muted-foreground">1/{formSteps.length}</p>
              <h3 className="ui-s1 col-span-full">{formSteps[0]}</h3>
            </div>

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

            <div className="col-span-full">
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
            </div>
          </div>
        )}
        {formStep === formSteps[1] && (
          <div className="grid auto-rows-max gap-sibling">
            <h3 className="ui-s1">Suppliers</h3>

            <FormField
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormFieldItem label="Credit suppliers">
                  <FormControl>
                    <div className="text-sm text-muted-foreground">
                      {field.value.map((credit) => (
                        <div key={credit.supplierId}>
                          {credit.supplierId} - {credit.service}
                        </div>
                      ))}
                    </div>
                  </FormControl>
                </FormFieldItem>
              )}
            />
          </div>
        )}
        <div data-test-id="form-footer" className="grid grid-cols-[1fr_auto_auto] gap-sibling">
          {formStep === formSteps[1] && (
            <Button variant="default" type="button" onClick={() => setFormStep(formSteps[0])}>
              Back
            </Button>
          )}
          <Button variant="ghost" type="button">
            Cancel
          </Button>
          {formStep === formSteps[0] ? (
            <Button variant="default" type="button" onClick={() => setFormStep(formSteps[1])}>
              Next
            </Button>
          ) : (
            <SubmitButton pendingChildren={'Please wait'}>Upload</SubmitButton>
          )}
        </div>
      </form>
    </Form>
  )
}
