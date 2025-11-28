'use client'

import { Check, ChevronDown } from 'lucide-react'
import { ControllerRenderProps } from 'react-hook-form'

import { useSupplierSearch } from '@/app/_hooks/use-supplier-search'
import { TileCreditForm as FormValues } from '@/app/_types/validation-schema'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utils/shadcn-utils'

type SupplierSearchInputProps = {
  field: ControllerRenderProps<FormValues, 'supplierId'>
}

export function SupplierSearchInput({ field }: SupplierSearchInputProps) {
  const { setSearchQuery, data: suppliers } = useSupplierSearch()
  const selectedSupplier = suppliers?.find((s) => s.id === field.value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="input" role="combobox" className="w-full justify-between" data-placeholder={!field.value ? true : null}>
          {selectedSupplier ? `${selectedSupplier.name} @${selectedSupplier.handle}` : 'Select supplier'}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search suppliers..." onValueChange={setSearchQuery} required />
          <CommandList>
            <CommandEmpty>No suppliers found.</CommandEmpty>
            <CommandGroup>
              {suppliers?.map((supplier) => (
                <CommandItem
                  key={supplier.handle}
                  value={supplier.handle}
                  onSelect={() => {
                    field.onChange(supplier.id)
                  }}>
                  <Check className={cn('mr-2 h-4 w-4', field.value === supplier.id ? 'opacity-100' : 'opacity-0')} />
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
