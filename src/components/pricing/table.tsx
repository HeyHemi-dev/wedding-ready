import React from 'react'

import { cn } from '@/utils/shadcn-utils'

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  isFirstColFrozen?: boolean
}

interface TableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  isAccent?: boolean
}

interface TableRowProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Table({ isFirstColFrozen, className, children, ...props }: TableProps) {
  return (
    <div
      data-element="table"
      className={cn(
        'grid',
        isFirstColFrozen && 'overflow-x-auto',
        '[&_[data-element="table-row"]>*:first-child]:sticky [&_[data-element="table-row"]>*:first-child]:left-0 [&_[data-element="table-row"]>*:first-child]:z-10 [&_[data-element="table-row"]>*:first-child]:bg-background',
        '[&_[data-element="table-row"]>*:first-child]:border-r [&_[data-element="table-row"]>*:first-child]:border-accent-foreground/10',
        className
      )}
      {...props}>
      {children}
    </div>
  )
}

export function TableRow({ className, children, ...props }: TableRowProps) {
  return (
    <div
      data-element="table-row"
      className={cn('col-span-full grid grid-cols-subgrid border-t border-accent-foreground/10 first:border-none', className)}
      {...props}>
      {children}
    </div>
  )
}

export function TableCell({ className, isAccent = false, children, ...props }: TableCellProps) {
  return (
    <div
      data-element="table-cell"
      className={cn('row-span-full grid place-content-center px-6 py-4 text-center', isAccent && 'bg-accent/60', className)}
      {...props}>
      {children}
    </div>
  )
}
