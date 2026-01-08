import React from 'react'

import { cn } from '@/utils/shadcn-utils'

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {}

interface TableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  isAccent?: boolean
}

interface TableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  isFirstColFrozen?: boolean
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className={cn('grid overflow-x-auto', className)} {...props}>
      {children}
    </div>
  )
}

export function TableRow({ isFirstColFrozen, className, children, ...props }: TableRowProps) {
  return (
    <div
      data-table-row
      className={cn(
        'col-span-full grid grid-cols-subgrid border-t border-accent-foreground/10 first:border-none',
        isFirstColFrozen &&
          '[&>*:first-child]:sticky [&>*:first-child]:left-0 [&>*:first-child]:z-10 [&>*:first-child]:border-r [&>*:first-child]:border-accent-foreground/10 [&>*:first-child]:bg-background',
        className
      )}
      {...props}>
      {children}
    </div>
  )
}

export function TableCell({ className, isAccent = false, children, ...props }: TableCellProps) {
  return (
    <div
      data-table-cell
      className={cn(
        // use solid 1px inner shadow instead of border-t
        'ui rows-span-full grid place-content-center px-6 py-4 text-center',
        isAccent && 'bg-accent/60',
        className
      )}
      {...props}>
      {children}
    </div>
  )
}
