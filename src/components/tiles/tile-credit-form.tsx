'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { TileCreditForm as FormValues, tileCreditFormSchema } from '@/app/_types/validation-schema'
import { useTileCredit } from '@/app/_hooks/use-tile-credit'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Service } from '@/db/constants'
import { enumToPretty } from '@/utils/enum-helpers'

export function TileCreditForm({ tileId, onSuccess }: { tileId: string; onSuccess: () => void }) {
  const { addCredit } = useTileCredit(tileId)
  const form = useForm<FormValues>({
    resolver: zodResolver(tileCreditFormSchema),
    defaultValues: {
      supplierId: '',
      service: undefined,
      serviceDescription: '',
    },
    mode: 'onBlur',
  })

  async function onSubmit(data: FormValues) {
    try {
      await addCredit(data)
      toast.success('Credit added')
      onSuccess()
      form.reset()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-friend">
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormFieldItem label="Supplier Id">
              <FormControl>
                <Input {...field} required />
              </FormControl>
            </FormFieldItem>
          )}
        />
        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormFieldItem label="Service">
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              </FormControl>
            </FormFieldItem>
          )}
        />
        <FormField
          control={form.control}
          name="serviceDescription"
          render={({ field }) => (
            <FormFieldItem label="Description">
              <FormControl>
                <Textarea {...field} rows={2} />
              </FormControl>
            </FormFieldItem>
          )}
        />
        <div className="flex justify-end gap-close-friend">
          <Button type="button" variant="ghost" onClick={() => onSuccess()}>
            Cancel
          </Button>
          <SubmitButton pendingChildren="Adding...">Add Credit</SubmitButton>
        </div>
      </form>
    </Form>
  )
}
