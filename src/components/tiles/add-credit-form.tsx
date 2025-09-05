'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useSupplierSearch } from '@/app/_hooks/use-supplier-search'
import { useTileCredit } from '@/app/_hooks/use-tile-credit'
import { TileCreditForm as FormValues, tileCreditFormSchema } from '@/app/_types/validation-schema'
import { FormFieldItem } from '@/components/form/field'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SERVICES } from '@/db/constants'
import { constToPretty } from '@/utils/const-helpers'
import { cn } from '@/utils/shadcn-utils'
import { tryCatch } from '@/utils/try-catch'

export function AddCreditForm({ tileId, setDialogOpen }: { tileId: string; setDialogOpen: (open: boolean) => void }) {
  const { addCredit } = useTileCredit(tileId)

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
    const { error } = await tryCatch(addCredit(data))

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Credit added')
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
                  <SupplierSearchCombobox
                    value={field.value}
                    onValueSelect={(supplierId) => {
                      field.onChange(supplierId)
                    }}
                  />
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

type SupplierSearchComboboxProps = {
  value: string | undefined
  onValueSelect: (supplierId: string | undefined) => void
}

export function SupplierSearchCombobox({ value, onValueSelect }: SupplierSearchComboboxProps) {
  const { setSearchQuery, data: suppliers } = useSupplierSearch()
  const selectedSupplier = suppliers?.find((s) => s.id === value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="input" role="combobox" className="w-full justify-between" data-placeholder={!value ? true : null}>
          {selectedSupplier ? `${selectedSupplier.name} @${selectedSupplier.handle}` : 'Select supplier'}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search suppliers..." onValueChange={setSearchQuery} />
          <CommandList>
            <CommandEmpty>No suppliers found.</CommandEmpty>
            <CommandGroup>
              {suppliers?.map((supplier) => (
                <CommandItem
                  key={supplier.handle}
                  value={supplier.handle}
                  onSelect={() => {
                    onValueSelect(supplier.id)
                  }}>
                  <Check className={cn('mr-2 h-4 w-4', value === supplier.id ? 'opacity-100' : 'opacity-0')} />
                  <div className="flex flex-col">
                    <span className="ui-small-s1">{supplier.name}</span>
                    <span className="ui-small opacity-80">@{supplier.handle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
