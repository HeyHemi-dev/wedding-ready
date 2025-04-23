'use client'

import { useState, useRef, useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { XCircle, CheckCircle, LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { HandleStatus, status } from '@/app/_types/handle-available-status'
import { SupplierRegistrationForm, supplierRegistrationFormSchema } from '@/app/_types/validation-schema'
import type { HandleGetResponseBody } from '@/app/api/suppliers/check-handle/[handle]/route'
import { FormFieldItem } from '@/components/form/field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Location, Service } from '@/db/constants'
import { enumToPretty, keyToEnum } from '@/utils/enum-helpers'
import { tryCatch, tryCatchFetch } from '@/utils/try-catch'

import { registrationFormAction } from './registration-form-action'

export default function RegistrationForm({ createdByUserId }: { createdByUserId: string }) {
  const router = useRouter()
  const controller = useRef(new AbortController())
  const [handleStatus, setHandleStatus] = useState<HandleStatus>(status.Undefined)
  const form = useForm<SupplierRegistrationForm>({
    resolver: zodResolver(supplierRegistrationFormSchema),
    defaultValues: {
      name: '',
      handle: '',
      websiteUrl: '',
      description: '',
      locations: [],
      services: [],
      createdByUserId,
    },
    mode: 'onBlur',
  })

  async function fetchHandleAvailability(value: string) {
    setHandleStatus(status.Pending)

    // Abort any existing request and create a new controller for this request
    controller.current.abort()
    controller.current = new AbortController()

    const { data, error } = await tryCatchFetch<HandleGetResponseBody>(`/api/suppliers/check-handle/${value}`, { signal: controller.current.signal })

    if (error) {
      setHandleStatus(status.Error)
      return
    }
    if (data?.isAvailable) {
      setHandleStatus(status.Available)
    } else {
      setHandleStatus(status.Taken)
    }
  }

  // Cleanup fetch request on unmount
  useEffect(() => {
    return () => {
      controller.current.abort()
    }
  }, [])

  async function onSubmit(data: SupplierRegistrationForm) {
    if (handleStatus !== status.Available) {
      toast.error('Handle is already taken')
      return
    }
    const { data: supplier, error } = await tryCatch(registrationFormAction({ data }))
    if (error) {
      toast.error(error.message)
    }
    if (supplier) {
      toast.success('Supplier registered')
      router.push(`/suppliers/${supplier.handle}`)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-sm">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormFieldItem label="Business name">
              <FormControl>
                <Input {...field} placeholder="Business name" />
              </FormControl>
            </FormFieldItem>
          )}
        />

        <FormField
          control={form.control}
          name="handle"
          render={({ field }) => (
            <FormFieldItem label="Handle">
              <FormControl>
                <div className="flex flex-row items-center gap-xs">
                  <Input
                    {...field}
                    placeholder="business_name"
                    onBlur={async (e) => {
                      field.onBlur()
                      const isValid = await form.trigger('handle')
                      if (!isValid) {
                        setHandleStatus(status.Undefined)
                        return
                      }
                      await fetchHandleAvailability(e.target.value)
                    }}
                  />
                  {handleStatus === status.Pending && <LoaderCircle className="h-6 w-6 animate-spin" />}
                  {handleStatus === status.Available && <CheckCircle className="h-6 w-6 text-green-500" />}
                  {handleStatus === status.Taken && <XCircle className="h-6 w-6 text-red-500" />}
                </div>
              </FormControl>
            </FormFieldItem>
          )}
        />

        <FormField
          control={form.control}
          name="locations"
          render={() => (
            <FormFieldItem label="Locations">
              <FormDescription>Select the regions your business serves. You can select multiple regions.</FormDescription>
              <div className="grid grid-cols-2 gap-sm">
                {enumToPretty(Location).map((location) => (
                  <FormField
                    key={location.value}
                    control={form.control}
                    name="locations"
                    render={({ field }) => {
                      return (
                        <FormItem key={location.value} className="flex flex-row items-center gap-xs">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(keyToEnum(Location, location.key))}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, keyToEnum(Location, location.key)])
                                  : field.onChange(field.value?.filter((value) => value !== keyToEnum(Location, location.key)))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{location.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
            </FormFieldItem>
          )}
        />

        <FormField
          control={form.control}
          name="services"
          render={() => (
            <FormFieldItem label="Services">
              <FormDescription>Select the services your business offers. You can select multiple services.</FormDescription>
              <div className="grid grid-cols-2 gap-sm">
                {enumToPretty(Service).map((service) => (
                  <FormField
                    key={service.value}
                    control={form.control}
                    name="services"
                    render={({ field }) => {
                      return (
                        <FormItem key={service.value} className="flex flex-row items-center gap-xs">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(keyToEnum(Service, service.key))}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, keyToEnum(Service, service.key)])
                                  : field.onChange(field.value?.filter((value) => value !== keyToEnum(Service, service.key)))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{service.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
            </FormFieldItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormFieldItem label="Website">
              <FormControl>
                <Input {...field} placeholder="https://www.business-name.co.nz" />
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
                <Textarea {...field} placeholder="Description" />
              </FormControl>
            </FormFieldItem>
          )}
        />

        <FormField control={form.control} name="createdByUserId" render={({ field }) => <Input {...field} type="hidden" value={createdByUserId} />} />

        <Button type="submit" className="self-end">
          {form.formState.isSubmitting ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </Form>
  )
}
