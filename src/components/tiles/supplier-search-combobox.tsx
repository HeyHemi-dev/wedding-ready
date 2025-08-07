'use client'

import { Check, ChevronsUpDown } from 'lucide-react'

import { useSupplierSearch } from '@/app/_hooks/use-supplier-search'
import { SupplierSearchResult } from '@/app/_types/suppliers'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utils/shadcn-utils'


type SupplierSearchComboboxProps = {
  value: SupplierSearchResult
  onValueSelect: (supplier: SupplierSearchResult | undefined) => void
  placeholder: string
}

export function SupplierSearchCombobox({ value, onValueSelect, placeholder = 'Search suppliers...' }: SupplierSearchComboboxProps) {
  const { setSearchQuery, data: suppliers } = useSupplierSearch()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {value ? `${value.name} @${value.handle}` : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} onValueChange={setSearchQuery} />
          <CommandList>
            <CommandEmpty>No suppliers found.</CommandEmpty>
            <CommandGroup>
              {suppliers?.map((supplier) => (
                <CommandItem
                  key={supplier.handle}
                  value={supplier.handle}
                  onSelect={() => {
                    onValueSelect(supplier)
                  }}>
                  <Check className={cn('mr-2 h-4 w-4', value?.id === supplier.id ? 'opacity-100' : 'opacity-0')} />
                  <div className="flex flex-col">
                    <span className="font-medium">{supplier.name}</span>
                    <span className="text-sm text-muted-foreground">@{supplier.handle}</span>
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
