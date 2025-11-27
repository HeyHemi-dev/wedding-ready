'use client'

import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { SupplierSearchResult } from '@/app/_types/suppliers'
import { tileCreditFormSchema, TileCreditForm as FormValues } from '@/app/_types/validation-schema'
import { FormFieldItem } from '@/components/form/field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Service, SERVICES } from '@/db/constants'
import { servicePretty } from '@/db/service-descriptions'
import { tryCatch } from '@/utils/try-catch'

import { RequestCreditAction } from './request-credit-action'

interface RequestCreditButtonProps {
  tileId: string
  userSuppliers: SupplierSearchResult[]
}

export function RequestCreditButton({ tileId, userSuppliers }: RequestCreditButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-spouse">
          <Plus className="h-4 w-4" />
          <span>Request credit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Request to be credited</DialogTitle>
        <RequestCreditForm tileId={tileId} suppliers={userSuppliers} setDialogOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  )
}

interface RequestCreditFormProps {
  tileId: string
  suppliers: SupplierSearchResult[]
  setDialogOpen: (open: boolean) => void
}

function RequestCreditForm({ tileId, suppliers, setDialogOpen }: RequestCreditFormProps) {
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
    const { error } = await tryCatch(RequestCreditAction(tileId, data))

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Credit request sent')
    form.reset()
    setDialogOpen(false)
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select from your suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          <div className="flex items-center gap-spouse">
                            <span className="ui-small-s1">{supplier.name}</span>
                            <span className="ui-small opacity-80">@{supplier.handle}</span>
                          </div>
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
            name="service"
            render={({ field }) => (
              <FormFieldItem label="Service">
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
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
          <Button type="submit" className="self-end">
            {form.formState.isSubmitting ? 'Requesting...' : 'Request credit'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
