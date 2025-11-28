'use client'

import * as React from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useTileCredit } from '@/app/_hooks/use-tile-credit'
import { TileCreditForm as FormValues, tileCreditFormSchema } from '@/app/_types/validation-schema'
import { FormFieldItem } from '@/components/form/field'
import { SupplierSearchInput } from '@/components/tiles/supplier-search-input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Service, SERVICES } from '@/db/constants'
import { servicePretty } from '@/db/service-descriptions'
import { tryCatch } from '@/utils/try-catch'

export function AddCreditButton({ tileId }: { tileId: string }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-spouse">
          <Plus className="h-4 w-4" />
          <span>Add credit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add credit</DialogTitle>
        <AddCreditForm tileId={tileId} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  )
}

function AddCreditForm({ tileId, setIsOpen }: { tileId: string; setIsOpen: (open: boolean) => void }) {
  const { addCredit } = useTileCredit(tileId)

  const form = useForm<FormValues>({
    resolver: zodResolver(tileCreditFormSchema),
    defaultValues: {
      supplierId: '',
      service: '' as Service, //service is required so it is safe to cast a default empty string as default, because we know it will be validated before submission
      serviceDescription: '',
    },
    mode: 'onBlur',
  })

  async function onSubmit(data: FormValues): Promise<void> {
    const isValid = await form.trigger()
    if (!isValid) return

    const { error } = await tryCatch(addCredit(data))

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Credit added')
    form.reset()
    setIsOpen(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-close-friend">
        <div className="grid gap-sibling">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormFieldItem label="Supplier">
                <FormControl>
                  <SupplierSearchInput field={field} />
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
                  <Select onValueChange={field.onChange} value={field.value} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service contribution" />
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
        <div className="flex justify-end">
          <Button type="submit" className="self-end" disabled={form.formState.isSubmitting || !form.formState.isValid}>
            {form.formState.isSubmitting ? 'Adding...' : 'Add credit'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
