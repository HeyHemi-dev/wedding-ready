'use client'

import { Check, ChevronDown } from 'lucide-react'

import { useSupplierSearch } from '@/app/_hooks/use-supplier-search'
import { ERROR_MESSAGE } from '@/app/_types/errors'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/shadcn-utils'

type SupplierSearchInputProps = {
  field: {
    value: string | undefined
    onChange: (value: string) => void
  }
  disabled?: boolean
}

export function SupplierSearchInput({ field, disabled = false }: SupplierSearchInputProps) {
  const { searchQuery, setSearchQuery, data: suppliers, isLoading, isError } = useSupplierSearch()
  const hasSearchQuery = searchQuery.trim().length > 0
  const hasResults = suppliers && suppliers.length > 0
  const selectedSupplier = suppliers?.find((s) => s.id === field.value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="input" role="combobox" className="w-full justify-between" data-placeholder={!field.value ? true : null} disabled={disabled}>
          {selectedSupplier ? `@${selectedSupplier.handle}` : 'Select supplier'}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search suppliers..." onValueChange={setSearchQuery} required />
          <CommandList>
            {!hasSearchQuery ? (
              <CommandEmpty>Start typing to search for suppliers.</CommandEmpty>
            ) : isLoading ? (
              <div className="p-2">
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <div className="flex flex-1 flex-col gap-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : isError ? (
              <CommandEmpty>{ERROR_MESSAGE.NETWORK_ERROR}</CommandEmpty>
            ) : !hasResults ? (
              <CommandEmpty>No suppliers found.</CommandEmpty>
            ) : (
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
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
