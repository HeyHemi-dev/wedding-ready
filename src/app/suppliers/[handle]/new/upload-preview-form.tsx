import * as React from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray, Control } from 'react-hook-form'

import { OPERATION_ERROR } from '@/app/_types/errors'
import { TileUploadForm, tileUploadFormSchema } from '@/app/_types/validation-schema'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { locationHelpers, serviceHelpers } from '@/utils/const-helpers'
import { cn } from '@/utils/shadcn-utils'

import { useUploadContext } from './upload-context'
import { SERVICES } from '@/db/constants'
import { servicePretty } from '@/db/service-descriptions'
import { X } from 'lucide-react'

const formSteps = ['Add Details', 'Credit Suppliers'] as const

type FormStep = (typeof formSteps)[number]

export function UploadPreviewForm({ onSubmit, onDelete }: { onSubmit: (data: TileUploadForm) => void; onDelete: () => void }) {
  const { supplier } = useUploadContext()
  if (!supplier) throw OPERATION_ERROR.INVALID_STATE()

  const form = useForm<TileUploadForm>({
    resolver: zodResolver(tileUploadFormSchema),
    defaultValues: {
      title: undefined,
      description: undefined,
      location: undefined,
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

  async function handleNext() {
    setFormStep(formSteps[1])
  }

  function handleBack() {
    setFormStep(formSteps[0])
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-rows-[auto_1fr] gap-friend">
        {formStep === formSteps[0] && (
          <div className="grid grid-cols-2 gap-sibling">
            <FormHeader step={formSteps[0]} className="col-span-full" />

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
          <div className="grid gap-sibling">
            <FormHeader step={formSteps[1]} />
            <CreditFieldArray control={form.control} />
          </div>
        )}
        <div data-test-id="form-footer" className="grid grid-cols-[1fr_auto_auto] gap-sibling">
          <div>
            {formStep === formSteps[1] && (
              <Button variant="default" type="button" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          <div>
            <Button variant="ghost" type="button" onClick={onDelete}>
              Delete
            </Button>
          </div>
          <div>
            {formStep === formSteps[0] ? (
              <Button variant="default" type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <SubmitButton pendingChildren={'Please wait'}>Upload</SubmitButton>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}

function FormHeader({ step, className }: { step: FormStep; className?: string }) {
  const index = formSteps.indexOf(step)
  return (
    <div className={cn('flex gap-partner', className)}>
      <p className="ui text-muted-foreground">
        {index + 1}/{formSteps.length}
      </p>
      <h3 className="ui-s1">{step}</h3>
    </div>
  )
}

function CreditFieldArray({ control }: { control: Control<TileUploadForm> }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'credits',
  })

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-sibling">
          <FormField
            control={control}
            name={`credits.${index}.supplierId`}
            render={({ field }) => (
              <FormFieldItem label="Supplier ID">
                <FormControl>
                  <Input {...field} placeholder="Enter supplier ID" />
                </FormControl>
              </FormFieldItem>
            )}
          />
          <FormField
            control={control}
            name={`credits.${index}.service`}
            render={({ field }) => (
              <FormFieldItem label="Service">
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SERVICES).map((service) => (
                        <SelectItem key={service} value={service}>
                          {servicePretty[service].value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormFieldItem>
            )}
          />
          <Button type="button" variant="destructive" className="aspect-square min-w-0 p-0" onClick={() => remove(index)} disabled={fields.length === 1}>
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <div className="flex justify-start">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              supplierId: '',
              service: undefined,
              serviceDescription: undefined,
            })
          }>
          Add Credit
        </Button>
      </div>
    </>
  )
}
