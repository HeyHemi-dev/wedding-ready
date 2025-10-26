'use client'

import { Button } from '@/components/ui/button'
import { SupplierSearchResult } from '@/app/_types/suppliers'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tileCreditFormSchema } from '@/app/_types/validation-schema'
import { toast } from 'sonner'
import { FormFieldItem } from '@/components/form/field'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { TileCreditForm as FormValues } from '@/app/_types/validation-schema'

import { Textarea } from '@/components/ui/textarea'
import { SERVICES } from '@/db/constants'
import { constToPretty } from '@/utils/const-helpers'
import { tryCatch } from '@/utils/try-catch'

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
        <DialogTitle>Request to be credit</DialogTitle>
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
      supplierId: undefined,
      service: undefined,
      serviceDescription: undefined,
    },
    mode: 'onBlur',
  })

  async function onSubmit(data: FormValues) {
    console.log('onSubmit', data)
    const { error } = await tryCatch(new Promise((resolve) => setTimeout(() => resolve(null), 1000)))

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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                          <span className="ui-small opacity-80">@{supplier.handle}</span>
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
        <div className="flex justify-end">
          <Button type="submit" className="self-end">
            {form.formState.isSubmitting ? 'Adding...' : 'Add credit'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
