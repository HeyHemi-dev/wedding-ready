'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useTileCredit } from '@/app/_hooks/use-tile-credit'
import { TileCreditForm as FormValues, tileCreditFormSchema } from '@/app/_types/validation-schema'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { SupplierSearchCombobox } from '@/components/tiles/supplier-search-combobox'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SERVICES } from '@/db/constants'
import { constToPretty } from '@/utils/const-helpers'

export function TileCreditForm({ tileId }: { tileId: string }) {
  const { addCredit } = useTileCredit(tileId)
  const form = useForm<FormValues>({
    resolver: zodResolver(tileCreditFormSchema),
    defaultValues: {
      supplier: undefined,
      service: undefined,
      serviceDescription: '',
    },
    mode: 'onBlur',
  })

  async function onSubmit(data: FormValues) {
    try {
      await addCredit(data)
      toast.success('Credit added')
      form.reset()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-close-friend">
        <div className="grid gap-sibling">
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormFieldItem label="Supplier">
                <FormControl>
                  <SupplierSearchCombobox value={field.value} onValueSelect={field.onChange} placeholder="Search for a supplier..." />
                </FormControl>
              </FormFieldItem>
            )}
          />
        </div>
        <div className="grid gap-sibling">
          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormFieldItem label="Service">
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service contribution" />
                    </SelectTrigger>
                    <SelectContent>
                      {constToPretty(SERVICES).map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormFieldItem>
            )}
          />
          <FormField
            control={form.control}
            name="serviceDescription"
            render={({ field }) => (
              <FormFieldItem label="Contribution description">
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
              </FormFieldItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-close-friend">
          <SubmitButton pendingChildren="Adding...">Add Credit</SubmitButton>
        </div>
      </form>
    </Form>
  )
}
