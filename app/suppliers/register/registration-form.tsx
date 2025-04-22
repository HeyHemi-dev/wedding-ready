'use client'

import Field, { FormFieldItem } from '@/components/form/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Location, Service } from '@/db/constants'

import { enumToPretty } from '@/utils/enum-helpers'

import { SupplierRegistrationForm, supplierRegistrationFormSchema } from '@/app/_types/validation-schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

export default function RegistrationForm({ createdByUserId }: { createdByUserId: string }) {
  const form = useForm<SupplierRegistrationForm>({
    resolver: zodResolver(supplierRegistrationFormSchema),
    defaultValues: {
      name: '',
      handle: '',
      websiteUrl: '',
      description: '',
      locations: [Location.AUCKLAND],
      services: [Service.VENUE],
    },
  })

  function onSubmit(data: SupplierRegistrationForm) {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-sm">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormFieldItem label="Business name">
              <Input {...field} placeholder="Business name" />
            </FormFieldItem>
          )}
        />

        <Field label="Handle" htmlFor="handle">
          <Input name="handle" placeholder="business_name" />
        </Field>

        <Field label="Locations served" htmlFor="location">
          <Select name="location">
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {enumToPretty(Location).map((location) => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Services offered" htmlFor="service">
          <Select name="service">
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {enumToPretty(Service).map((service) => (
                <SelectItem key={service.value} value={service.value}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Website" htmlFor="website">
          <Input name="website" placeholder="Website url" />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea name="description" placeholder="Description" />
        </Field>

        <Input name="userId" type="hidden" value={createdByUserId} />
        <Button type="submit" className="self-end">
          Register
        </Button>
      </form>
    </Form>
  )
}
