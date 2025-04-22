'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Location, Service } from '@/db/constants'

import { enumToPretty, keyToEnum } from '@/utils/enum-helpers'

import { SupplierRegistrationForm, supplierRegistrationFormSchema } from '@/app/_types/validation-schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { registrationFormAction } from './registration-form-action'
import { Checkbox } from '@/components/ui/checkbox'
import { FormFieldItem } from '@/components/form/field'

export default function RegistrationForm({ createdByUserId }: { createdByUserId: string }) {
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

  // OnSubmit handles sending the data to a matching server action
  async function onSubmit(data: SupplierRegistrationForm) {
    console.log('onSubmit')
    await registrationFormAction({ data })
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
                <Input {...field} placeholder="business_name" />
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
              <div className="grid grid-cols-2 gap-xs">
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
              <div className="grid grid-cols-2 gap-xs">
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
          Register
        </Button>
      </form>
    </Form>
  )
}
